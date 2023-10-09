import { Lending } from "../generated/Lending/Lending";
import { Loan, Nft } from "../generated/schema";
import { Address, BigInt } from "@graphprotocol/graph-ts";

export function calculateDueAmount(_lendingAddress: Address, _amount: BigInt, _interestRate: BigInt, _duration: BigInt): BigInt {
  let lending = Lending.bind(_lendingAddress);
  let protocolfee = lending.protocolFee();
  let originationFee = lending.getOriginationFee(_amount);
  let debt = lending.getDebtWithPenalty(_amount, _interestRate.plus(protocolfee), _duration, _duration);

  return _amount.plus(originationFee).plus(debt);
}

export function fetchLoan(_loanId: BigInt): Loan {
  let entity = Loan.load(_loanId.toString());

  if (entity == null) {
    entity = new Loan(_loanId.toString());
  }

  return entity;
}

export function fetchNft(nftId: string): Nft {
  let entity = Nft.load(nftId);

  if (entity == null) {
    entity = new Nft(nftId);
  }

  return entity;
}
