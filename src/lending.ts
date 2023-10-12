import { Address, BigInt } from "@graphprotocol/graph-ts";
import {
  LoanAccepted as LoanAcceptedEvent,
  LoanCreated as LoanCreatedEvent,
  LoanLiquidated as LoanLiquidatedEvent,
  LoanRepayment as LoanRepaymentEvent,
  LoanCancelled as LoanCancelledEvent,
  NFTClaimed as NFTClaimedEvent
} from "../generated/Lending/Lending";
import { Event } from "../generated/schema";
import { fetchLoan, calculateDueAmount, fetchNft, removeFromArray } from "./utils";

export function handleLoanCreated(event: LoanCreatedEvent): void {
  let entity = fetchLoan(event.params.loanId);
  let nft = fetchNft(`${event.params.nftCollection.toHexString()}${event.params.nftId}`);
  let dueAmount = calculateDueAmount(event.address, event.params.amount, event.params.interestRate, event.params.duration);

  entity.status = "REQUESTED";
  entity.borrower = event.params.borrower;
  entity.token = event.params.token;
  entity.amount = event.params.amount;
  entity.nft = nft.id;
  entity.duration = event.params.duration;
  entity.deadline = event.params.deadline;
  entity.interestRate = event.params.interestRate;
  entity.collateralValue = event.params.collateralValue;
  entity.dueAmount = dueAmount;
  entity.lender = Address.zero();
  entity.startTime = BigInt.zero();
  entity.endTime = BigInt.zero();
  entity.totalPaid = BigInt.zero();
  entity.feePaid = BigInt.zero();
  entity.liquidator = Address.zero();

  entity.save();

  let ev = new Event(event.transaction.hash.toHex());
  ev.eventType = "REQUESTED";
  ev.time = event.block.timestamp;
  ev.transactionHash = event.transaction.hash;
  ev.loan = entity.id;

  ev.save();

  let loans = nft.loans || [];
  loans!.push(entity.id);
  nft.loans = loans;

  nft.save();
}

export function handleLoanCancelled(event: LoanCancelledEvent): void {
  let entity = fetchLoan(event.params.loanId);

  entity.status = "CANCELLED";

  entity.save();

  let ev = new Event(event.transaction.hash.toHex());
  ev.eventType = "CANCELLED";
  ev.time = event.block.timestamp;
  ev.transactionHash = event.transaction.hash;
  ev.loan = entity.id;

  ev.save();
}

export function handleLoanAccepted(event: LoanAcceptedEvent): void {
  let entity = fetchLoan(event.params.loanId);

  entity.status = "ACCEPTED";
  entity.lender = event.params.lender;
  entity.startTime = event.params.startTime;
  entity.endTime = event.params.startTime.plus(entity.duration);

  entity.save();

  let ev = new Event(event.transaction.hash.toHex());
  ev.eventType = "ACCEPTED";
  ev.time = event.block.timestamp;
  ev.transactionHash = event.transaction.hash;
  ev.loan = entity.id;

  ev.save();
}

export function handleLoanLiquidated(event: LoanLiquidatedEvent): void {
  let entity = fetchLoan(event.params.loanId);

  entity.status = "LIQUIDATED";
  entity.totalPaid = event.params.totalPaid;
  entity.feePaid = event.params.fees;
  entity.liquidator = event.params.liquidator;

  entity.save();

  let ev = new Event(event.transaction.hash.toHex());
  ev.eventType = "LIQUIDATED";
  ev.time = event.block.timestamp;
  ev.transactionHash = event.transaction.hash;
  ev.loan = entity.id;

  ev.save();
}

export function handleLoanRepayment(event: LoanRepaymentEvent): void {
  let entity = fetchLoan(event.params.loanId);

  entity.status = "REPAID";
  entity.totalPaid = event.params.totalPaid;
  entity.feePaid = event.params.fees;

  entity.save();

  let ev = new Event(event.transaction.hash.toHex());
  ev.eventType = "REPAID";
  ev.time = event.block.timestamp;
  ev.transactionHash = event.transaction.hash;
  ev.loan = entity.id;

  ev.save();
}

export function handleNFTClaimed(event: NFTClaimedEvent): void {
  let entity = fetchLoan(event.params.loanId);

  entity.status = "NFT_CLAIMED";

  entity.save();

  let ev = new Event(event.transaction.hash.toHex());
  ev.eventType = "NFT_CLAIMED";
  ev.time = event.block.timestamp;
  ev.transactionHash = event.transaction.hash;
  ev.loan = entity.id;

  ev.save();
}
