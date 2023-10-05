import { Address, BigInt } from "@graphprotocol/graph-ts";
import {
  LoanAccepted as LoanAcceptedEvent,
  LoanCreated as LoanCreatedEvent,
  LoanLiquidated as LoanLiquidatedEvent,
  LoanRepayment as LoanRepaymentEvent,
  LoanCancelled as LoanCancelledEvent,
  NFTClaimed as NFTClaimedEvent
} from "../generated/Lending/Lending";
import { Lending } from "../generated/Lending/Lending";
import { Event, Loan } from "../generated/schema";

function calculateDueAmount(
  _lendingAddress: Address,
  _amount: BigInt,
  _interestRate: BigInt,
  _duration: BigInt,
): BigInt {
  let lending = Lending.bind(_lendingAddress);
  let protocolfee = lending.protocolFee();
  let originationFee = lending.getOriginationFee(_amount);
  let debt = lending.getDebtWithPenalty(_amount, _interestRate.plus(protocolfee), _duration, _duration)

  return _amount.plus(originationFee).plus(debt)
}

function fetchLoan(_loanId: BigInt): Loan {
  let entity = Loan.load(_loanId.toString());

  if (entity == null) {
    entity = new Loan(_loanId.toString());
  }

  return entity
}

export function handleLoanCreated(event: LoanCreatedEvent): void {
  let entity = fetchLoan(event.params.loanId);

  let dueAmount = calculateDueAmount(
    event.address,
    event.params.amount,
    event.params.interestRate,
    event.params.duration,
  ); 

  entity.status = "REQUESTED";
  entity.borrower = event.params.borrower;
  entity.token = event.params.token;
  entity.amount = event.params.amount;
  entity.nftCollection = event.params.nftCollection;
  entity.nftId = event.params.nftId;
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
  entity.feePaid = event.params.fees
  entity.liquidator = event.params.liquidator

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
  entity.feePaid = event.params.fees

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