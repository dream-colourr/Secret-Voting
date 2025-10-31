// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {FHE, euint32, externalEuint32, ebool} from "@fhevm/solidity/lib/FHE.sol";
import {SepoliaConfig} from "@fhevm/solidity/config/ZamaConfig.sol";

contract SecretVote is SepoliaConfig {
    struct Proposal {
        string title;
        string[] options;
        uint64 startTime;
        uint64 endTime;
        address creator;
        bool finalized;
        bool decryptionPending;
        uint256 requestId;
        euint32[] counts; // encrypted counts per option
        uint32[] clearCounts; // revealed counts after finalize
        uint256 voterCount; // total voters (plaintext)
    }

    // proposalId => Proposal
    mapping(uint256 => Proposal) private _proposals;
    uint256 private _proposalCount;

    // proposalId => voter => has voted (plaintext to enforce single vote)
    mapping(uint256 => mapping(address => bool)) public hasVoted;

    // requestId => proposalId
    mapping(uint256 => uint256) private _requestToProposal;

    event ProposalCreated(uint256 indexed proposalId, string title, string[] options, uint64 startTime, uint64 endTime);
    event Voted(uint256 indexed proposalId, address indexed voter);
    event FinalizeRequested(uint256 indexed proposalId, uint256 requestId);
    event Finalized(uint256 indexed proposalId, uint32[] results);

    modifier existingProposal(uint256 proposalId) {
        require(proposalId < _proposalCount, "invalid proposal");
        _;
    }

    function createProposal(
        string memory title,
        string[] memory options,
        uint64 startTime,
        uint64 endTime
    ) external returns (uint256 proposalId) {
        require(bytes(title).length > 0, "empty title");
        require(options.length >= 2 && options.length <= 16, "invalid options");
        require(endTime > startTime && endTime > block.timestamp, "invalid times");

        proposalId = _proposalCount++;
        Proposal storage p = _proposals[proposalId];
        p.title = title;
        p.options = options;
        p.startTime = startTime;
        p.endTime = endTime;
        p.creator = msg.sender;
        p.finalized = false;
        p.decryptionPending = false;
        p.requestId = 0;

        // initialize encrypted counts and clearCounts
        p.counts = new euint32[](options.length);
        p.clearCounts = new uint32[](options.length);

        emit ProposalCreated(proposalId, title, options, startTime, endTime);
    }

    // SimpleTests compatibility wrapper with explicit revert messages
    function createVote(
        string memory title,
        string[] memory options,
        uint64 startTime,
        uint64 endTime
    ) external returns (uint256) {
        require(options.length >= 2, "Must have at least 2 options");
        require(startTime > block.timestamp, "Start time must be in the future");
        require(endTime > startTime, "End time must be after start time");
        uint256 proposalId = _proposalCount++;
        Proposal storage p = _proposals[proposalId];
        p.title = title;
        p.options = options;
        p.startTime = startTime;
        p.endTime = endTime;
        p.creator = msg.sender;
        p.finalized = false;
        p.decryptionPending = false;
        p.requestId = 0;

        p.counts = new euint32[](options.length);
        p.clearCounts = new uint32[](options.length);

        emit ProposalCreated(proposalId, title, options, startTime, endTime);
        return proposalId;
    }

    function getProposalCount() external view returns (uint256) {
        return _proposalCount;
    }

    function getProposal(
        uint256 proposalId
    ) external view existingProposal(proposalId) returns (string memory, string[] memory, uint64, uint64, bool, bool) {
        Proposal storage p = _proposals[proposalId];
        return (p.title, p.options, p.startTime, p.endTime, p.finalized, p.decryptionPending);
    }

    function getTotalVotes() external view returns (uint256) {
        return _proposalCount;
    }

    struct VoteInfo {
        string title;
        string[] options;
        uint64 startTime;
        uint64 endTime;
        address creator;
        bool isDecrypted;
    }

    function getVoteInfo(uint256 proposalId) external view existingProposal(proposalId) returns (VoteInfo memory) {
        Proposal storage p = _proposals[proposalId];
        return VoteInfo({
            title: p.title,
            options: p.options,
            startTime: p.startTime,
            endTime: p.endTime,
            creator: p.creator,
            isDecrypted: p.finalized
        });
    }

    function getEncryptedCounts(uint256 proposalId) external view existingProposal(proposalId) returns (bytes32[] memory) {
        Proposal storage p = _proposals[proposalId];
        bytes32[] memory cts = new bytes32[](p.counts.length);
        for (uint256 i = 0; i < p.counts.length; i++) {
            cts[i] = FHE.toBytes32(p.counts[i]);
        }
        return cts;
    }

    function getEncryptedCount(uint256 proposalId, uint256 optionIndex)
        external
        view
        existingProposal(proposalId)
        returns (euint32)
    {
        Proposal storage p = _proposals[proposalId];
        require(optionIndex < p.counts.length, "bad index");
        return p.counts[optionIndex];
    }

    function getResults(uint256 proposalId) external view existingProposal(proposalId) returns (uint32[] memory) {
        Proposal storage p = _proposals[proposalId];
        require(p.finalized, "not finalized");
        return p.clearCounts;
    }

    function getVoterCount(uint256 proposalId) external view existingProposal(proposalId) returns (uint256) {
        return _proposals[proposalId].voterCount;
    }

    function vote(uint256 proposalId, externalEuint32 encryptedIndex, bytes calldata inputProof) external existingProposal(proposalId) {
        Proposal storage p = _proposals[proposalId];
        require(block.timestamp >= p.startTime, "not started");
        require(block.timestamp <= p.endTime, "ended");
        require(!p.finalized, "finalized");
        require(!hasVoted[proposalId][msg.sender], "already voted");

        euint32 idx = FHE.fromExternal(encryptedIndex, inputProof);
        for (uint256 i = 0; i < p.counts.length; i++) {
            ebool matchI = FHE.eq(idx, FHE.asEuint32(uint32(i)));
            euint32 addend = FHE.select(matchI, FHE.asEuint32(1), FHE.asEuint32(0));
            p.counts[i] = FHE.add(p.counts[i], addend);
            FHE.allowThis(p.counts[i]);
            FHE.allow(p.counts[i], msg.sender);
            FHE.allow(p.counts[i], p.creator);
        }

        hasVoted[proposalId][msg.sender] = true;
        p.voterCount += 1;
        emit Voted(proposalId, msg.sender);
    }

    function requestFinalize(uint256 proposalId) external existingProposal(proposalId) {
        Proposal storage p = _proposals[proposalId];
        require(block.timestamp > p.endTime, "not ended");
        require(!p.finalized, "already finalized");
        require(!p.decryptionPending, "pending");

        bytes32[] memory cts = new bytes32[](p.counts.length);
        for (uint256 i = 0; i < p.counts.length; i++) {
            cts[i] = FHE.toBytes32(p.counts[i]);
        }

        uint256 requestId = FHE.requestDecryption(cts, this.decryptionCallback.selector);
        p.decryptionPending = true;
        p.requestId = requestId;
        _requestToProposal[requestId] = proposalId;
        emit FinalizeRequested(proposalId, requestId);
    }

    function decryptionCallback(uint256 requestId, bytes memory cleartexts, bytes[] memory signatures) public returns (bool) {
        uint256 proposalId = _requestToProposal[requestId];
        require(proposalId < _proposalCount, "invalid request");

        Proposal storage p = _proposals[proposalId];
        require(p.decryptionPending && p.requestId == requestId, "no pending");

        // Verify KMS signatures
        FHE.checkSignatures(requestId, signatures);

        // Decode results — values correspond to counts per option, encoded as uint32 sequence
        // We expect abi.encode(uint32, uint32, ...)
        uint32[] memory results = abi.decode(cleartexts, (uint32[]));
        require(results.length == p.counts.length, "mismatch");

        for (uint256 i = 0; i < results.length; i++) {
            p.clearCounts[i] = results[i];
        }

        p.finalized = true;
        p.decryptionPending = false;

        emit Finalized(proposalId, p.clearCounts);
        return true;
    }
}
