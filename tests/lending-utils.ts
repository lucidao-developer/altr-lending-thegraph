import { newMockEvent } from "matchstick-as"
import { ethereum, Address, BigInt } from "@graphprotocol/graph-ts"
import {
  FeeWithdrawn,
  LoanAccepted,
  LoanCreated,
  LoanLiquidated,
  LoanRepayment,
  OwnershipTransferred
} from "../generated/Lending/Lending"

export function createFeeWithdrawnEvent(
  token: Address,
  amount: BigInt
): FeeWithdrawn {
  let feeWithdrawnEvent = changetype<FeeWithdrawn>(newMockEvent())

  feeWithdrawnEvent.parameters = new Array()

  feeWithdrawnEvent.parameters.push(
    new ethereum.EventParam("token", ethereum.Value.fromAddress(token))
  )
  feeWithdrawnEvent.parameters.push(
    new ethereum.EventParam("amount", ethereum.Value.fromUnsignedBigInt(amount))
  )

  return feeWithdrawnEvent
}

export function createLoanAcceptedEvent(
  loanId: BigInt,
  loan: ethereum.Tuple
): LoanAccepted {
  let loanAcceptedEvent = changetype<LoanAccepted>(newMockEvent())

  loanAcceptedEvent.parameters = new Array()

  loanAcceptedEvent.parameters.push(
    new ethereum.EventParam("loanId", ethereum.Value.fromUnsignedBigInt(loanId))
  )
  loanAcceptedEvent.parameters.push(
    new ethereum.EventParam("loan", ethereum.Value.fromTuple(loan))
  )

  return loanAcceptedEvent
}

export function createLoanCreatedEvent(
  loanId: BigInt,
  loan: ethereum.Tuple
): LoanCreated {
  let loanCreatedEvent = changetype<LoanCreated>(newMockEvent())

  loanCreatedEvent.parameters = new Array()

  loanCreatedEvent.parameters.push(
    new ethereum.EventParam("loanId", ethereum.Value.fromUnsignedBigInt(loanId))
  )
  loanCreatedEvent.parameters.push(
    new ethereum.EventParam("loan", ethereum.Value.fromTuple(loan))
  )

  return loanCreatedEvent
}

export function createLoanLiquidatedEvent(
  loanId: BigInt,
  loan: ethereum.Tuple,
  liquidator: Address,
  totalPaid: BigInt,
  fees: BigInt
): LoanLiquidated {
  let loanLiquidatedEvent = changetype<LoanLiquidated>(newMockEvent())

  loanLiquidatedEvent.parameters = new Array()

  loanLiquidatedEvent.parameters.push(
    new ethereum.EventParam("loanId", ethereum.Value.fromUnsignedBigInt(loanId))
  )
  loanLiquidatedEvent.parameters.push(
    new ethereum.EventParam("loan", ethereum.Value.fromTuple(loan))
  )
  loanLiquidatedEvent.parameters.push(
    new ethereum.EventParam(
      "liquidator",
      ethereum.Value.fromAddress(liquidator)
    )
  )
  loanLiquidatedEvent.parameters.push(
    new ethereum.EventParam(
      "totalPaid",
      ethereum.Value.fromUnsignedBigInt(totalPaid)
    )
  )
  loanLiquidatedEvent.parameters.push(
    new ethereum.EventParam("fees", ethereum.Value.fromUnsignedBigInt(fees))
  )

  return loanLiquidatedEvent
}

export function createLoanRepaymentEvent(
  loanId: BigInt,
  loan: ethereum.Tuple,
  totalPaid: BigInt,
  fees: BigInt
): LoanRepayment {
  let loanRepaymentEvent = changetype<LoanRepayment>(newMockEvent())

  loanRepaymentEvent.parameters = new Array()

  loanRepaymentEvent.parameters.push(
    new ethereum.EventParam("loanId", ethereum.Value.fromUnsignedBigInt(loanId))
  )
  loanRepaymentEvent.parameters.push(
    new ethereum.EventParam("loan", ethereum.Value.fromTuple(loan))
  )
  loanRepaymentEvent.parameters.push(
    new ethereum.EventParam(
      "totalPaid",
      ethereum.Value.fromUnsignedBigInt(totalPaid)
    )
  )
  loanRepaymentEvent.parameters.push(
    new ethereum.EventParam("fees", ethereum.Value.fromUnsignedBigInt(fees))
  )

  return loanRepaymentEvent
}

export function createOwnershipTransferredEvent(
  previousOwner: Address,
  newOwner: Address
): OwnershipTransferred {
  let ownershipTransferredEvent = changetype<OwnershipTransferred>(
    newMockEvent()
  )

  ownershipTransferredEvent.parameters = new Array()

  ownershipTransferredEvent.parameters.push(
    new ethereum.EventParam(
      "previousOwner",
      ethereum.Value.fromAddress(previousOwner)
    )
  )
  ownershipTransferredEvent.parameters.push(
    new ethereum.EventParam("newOwner", ethereum.Value.fromAddress(newOwner))
  )

  return ownershipTransferredEvent
}
