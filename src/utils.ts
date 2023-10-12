import { Lending } from "../generated/Lending/Lending";
import { Loan, Nft } from "../generated/schema";
import { Address, BigInt } from "@graphprotocol/graph-ts";

export function calculateDueAmount(
  _lendingAddress: Address,
  _amount: BigInt,
  _interestRate: BigInt,
  _duration: BigInt,
  _token: Address
): BigInt {
  let lending = Lending.bind(_lendingAddress);
  let protocolFee = lending.protocolFee();
  let originationFee = lending.getOriginationFee(_amount, _token);
  let debt = lending.getDebtWithPenalty(_amount, _interestRate.plus(protocolFee), _duration, _duration);

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

export function search<T>(array: T[] | null, element: T): i32 {
  let index = -1;
  if (array === null) {
    array = [];
  }
  for (let i = 0; i < array.length; i++) {
    if (array[i] == element) {
      index = i;
    }
  }
  return index as i32;
}

export function removeFromArray<T>(array: T[] | null, element: T): T[] {
  if (array === null) {
    array = [];
  }

  let index = search(array, element);

  if (index != -1) {
    array.splice(index, 1);
  }
  return array;
}
