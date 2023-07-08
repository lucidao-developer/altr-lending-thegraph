import { Address, BigInt } from "@graphprotocol/graph-ts";
import {
  LoanAccepted as LoanAcceptedEvent,
  LoanCreated as LoanCreatedEvent,
  LoanLiquidated as LoanLiquidatedEvent,
  LoanRepayment as LoanRepaymentEvent,
} from "../generated/Lending/Lending";
import { Event, Loan } from "../generated/schema";
import { fetchRepaymentAmount } from "./utils";


export function handleLoanCreated(event: LoanCreatedEvent): void {
  let repayment = fetchRepaymentAmount(
    event.address,
    event.params.amount,
    BigInt.zero(),
    event.params.interestRate,
    event.params.duration,
    event.block.timestamp,
    BigInt.zero()
  );

  let entity = Loan.load(event.params.loanId.toString());

  if (entity == null) {
    entity = new Loan(event.params.loanId.toString());
  }

  entity.live = false;
  entity.borrower = event.params.borrower;
  entity.token = event.params.token;
  entity.amount = event.params.amount;
  entity.nftCollection = event.params.nftCollection;
  entity.nftId = event.params.nftId;
  entity.duration = event.params.duration;
  entity.interestRate = event.params.interestRate;
  entity.collateralValue = event.params.collateralValue;
  entity.lender = Address.zero();
  entity.startTime = BigInt.zero();
  entity.paidAmount = BigInt.zero();
  entity.repaymentAmount = repayment;
  entity.leftAmount = event.params.amount;

  entity.save();

  let ev = new Event(event.transaction.hash.toHex());
  ev.eventType = "LOAN_REQUESTED";
  ev.time = event.block.timestamp;
  ev.transactionHash = event.transaction.hash;
  ev.loan = entity.id;

  ev.save();
}

export function handleLoanAccepted(event: LoanAcceptedEvent): void {
  let entity = Loan.load(event.params.loanId.toString());

  if (entity == null) {
    entity = new Loan(event.params.loanId.toString());
  }

  entity.live = true;
  entity.lender = event.params.lender;
  entity.startTime = event.params.startTime;

  entity.save();

  let ev = new Event(event.transaction.hash.toHex());
  ev.eventType = "LOAN_ACCEPTED";
  ev.time = event.block.timestamp;
  ev.transactionHash = event.transaction.hash;
  ev.loan = entity.id;

  entity.save();
  ev.save();
}

export function handleLoanLiquidated(event: LoanLiquidatedEvent): void {
  let entity = Loan.load(event.params.loanId.toString());

  if (entity == null) {
    entity = new Loan(event.params.loanId.toString());
  }

  let repayment = fetchRepaymentAmount(
    event.address,
    entity.amount,
    event.params.paidAmount,
    entity.interestRate,
    entity.duration,
    event.block.timestamp,
    entity.startTime
  );

  entity.live = false;
  entity.paidAmount = event.params.paidAmount;
  entity.repaymentAmount = repayment;
  entity.leftAmount = entity.amount.minus(event.params.paidAmount);

  entity.save();

  let ev = new Event(event.transaction.hash.toHex());
  ev.eventType = "LOAN_LIQUIDATED";
  ev.time = event.block.timestamp;
  ev.transactionHash = event.transaction.hash;
  ev.loan = entity.id;

  entity.save();
  ev.save();
}

export function handleLoanRepayment(event: LoanRepaymentEvent): void {
  let entity = Loan.load(event.params.loanId.toString());

  if (entity == null) {
    entity = new Loan(event.params.loanId.toString());
  }

  let repayment = fetchRepaymentAmount(
    event.address,
    entity.amount,
    event.params.paidAmount,
    entity.interestRate,
    entity.duration,
    event.block.timestamp,
    entity.startTime
  );

  if (entity.amount.equals(event.params.paidAmount)) {
    entity.live = false;
  } else {
    entity.live = true;
  }
  entity.paidAmount = event.params.paidAmount;
  entity.repaymentAmount = repayment;
  entity.leftAmount = entity.amount.minus(event.params.paidAmount);

  entity.save();

  let ev = new Event(event.transaction.hash.toHex());
  ev.eventType = "LOAN_REPAYMENT";
  ev.time = event.block.timestamp;
  ev.transactionHash = event.transaction.hash;
  ev.loan = entity.id;

  entity.save();
  ev.save();
}
