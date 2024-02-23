import { Address, BigInt } from "@graphprotocol/graph-ts";
import {
  LoanAccepted as LoanAcceptedEvent,
  LoanCreated as LoanCreatedEvent,
  LoanLiquidated as LoanLiquidatedEvent,
  LoanRepayment as LoanRepaymentEvent,
  LoanCancelled as LoanCancelledEvent,
  NFTClaimed as NFTClaimedEvent,
  PriceIndexSet,
  AllowListSet,
  GovernanceTreasurySet,
  RepayGraceFeeSet,
  RepayGracePeriodSet,
  ProtocolFeeSet,
  LiquidationFeeSet,
  BaseOriginationFeeSet,
  TokensSet,
  TokensUnset,
  LoanTypesSet,
  LoanTypesUnset,
  OriginationFeeRangesSet,
  FeeReductionFactorSet,
  LenderExclusiveLiquidationPeriodSet,
  NFTAllowed,
  NFTDisallowed
} from "../generated/Lending/Lending";
import { Event } from "../generated/schema";
import { fetchLoan, calculateDueAmount, fetchNft, fetchParams, removeFromArray, search } from "./utils";

export function handleLoanCreated(event: LoanCreatedEvent): void {
  let entity = fetchLoan(event.params.loanId);
  let nft = fetchNft(`${event.params.nftCollection.toHexString()}${event.params.nftId}`);
  let dueAmount = calculateDueAmount(
    event.address,
    event.params.amount,
    event.params.interestRate,
    event.params.duration,
    event.params.token
  );

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
  ev.user = event.params.borrower;

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
  ev.user = entity.borrower;

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
  ev.user = event.params.lender;

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
  ev.user = event.params.liquidator;

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
  ev.user = entity.borrower;

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
  ev.user = event.transaction.from;

  ev.save();
}

export function handlePriceIndexSet(event: PriceIndexSet): void {
  let entity = fetchParams(event.address);
  entity.priceIndex = event.params.newPriceIndex;
  entity.save();
}

export function handleAllowListSet(event: AllowListSet): void {
  let entity = fetchParams(event.address);
  entity.allowList = event.params.newAllowList;
  entity.save();
}

export function handleGovernanceTreasurySet(event: GovernanceTreasurySet): void {
  let entity = fetchParams(event.address);
  entity.governanceTreasury = event.params.newGovernanceTreasury;
  entity.save();
}

export function handleRepayGracePeriodSet(event: RepayGracePeriodSet): void {
  let entity = fetchParams(event.address);
  entity.repayGracePeriod = event.params.newRepayGracePeriod;
  entity.save();
}

export function handleRepayGraceFeeSet(event: RepayGraceFeeSet): void {
  let entity = fetchParams(event.address);
  entity.repayGraceFee = event.params.newRepayGraceFee;
  entity.save();
}

export function handleProtocolFeeSet(event: ProtocolFeeSet): void {
  let entity = fetchParams(event.address);
  entity.protocolFee = event.params.newProtocolFee;
  entity.save();
}

export function handleLiquidationFeeSet(event: LiquidationFeeSet): void {
  let entity = fetchParams(event.address);
  entity.liquidationFee = event.params.newLiquidationFee;
  entity.save();
}

export function handleBaseOriginationFeeSet(event: BaseOriginationFeeSet): void {
  let entity = fetchParams(event.address);
  entity.baseOriginationFee = event.params.newBaseOriginationFee;
  entity.save();
}

export function handleTokensSet(event: TokensSet): void {
  let entity = fetchParams(event.address);
  const tokens = entity.tokens || [];
  for (let i = 0; i < event.params.tokens.length; i++) {
    tokens.push(event.params.tokens[i]);
  }

  entity.tokens = tokens;
  entity.save();
}

export function handleTokensUnset(event: TokensUnset): void {
  let entity = fetchParams(event.address);
  let tokens = entity.tokens || [];
  for (let i = 0; i < event.params.tokens.length; i++) {
    tokens = removeFromArray(tokens, event.params.tokens[i]);
  }

  entity.tokens = tokens;
  entity.save();
}

export function handleLoanTypesSet(event: LoanTypesSet): void {
  let entity = fetchParams(event.address);
  const durations = entity.loanTypesDurations || [];
  const interestRates = entity.loanTypesInterestRates || [];

  for (let i = 0; i < event.params.durations.length; i++) {
    durations.push(event.params.durations[i]);
    interestRates.push(event.params.interestRates[i]);
  }

  entity.loanTypesDurations = durations;
  entity.loanTypesInterestRates = interestRates;
  entity.save();
}

export function handleLoanTypesUnset(event: LoanTypesUnset): void {
  let entity = fetchParams(event.address);
  let durations = entity.loanTypesDurations || [];
  const interestRates = entity.loanTypesInterestRates || [];

  for (let i = 0; i < event.params.durations.length; i++) {
    const index = search(durations, event.params.durations[i]);
    durations = removeFromArray(durations, event.params.durations[i]);
    interestRates.splice(index, 1);
  }

  entity.loanTypesDurations = durations;
  entity.loanTypesInterestRates = interestRates;
  entity.save();
}

export function handleOriginationFeeRangesSet(event: OriginationFeeRangesSet): void {
  let entity = fetchParams(event.address);
  entity.originationFeeRanges = event.params.originationFeeRanges;
  entity.save();
}

export function handleFeeReductionFactorSet(event: FeeReductionFactorSet): void {
  let entity = fetchParams(event.address);
  entity.feeReductionFactor = event.params.feeReductionFactor;
  entity.save();
}

export function handleLenderExclusiveLiquidationPeriodSet(event: LenderExclusiveLiquidationPeriodSet): void {
  let entity = fetchParams(event.address);
  entity.lenderExclusiveLiquidationPeriod = event.params.lenderExclusiveLiquidationPeriod;
  entity.save();
}

export function handleNFTAllowed(event: NFTAllowed): void {
  let entity = fetchParams(event.address);

  let nfts = entity.disallowedNfts;
  nfts = removeFromArray(nfts, `${event.params.collectionAddress.toHexString()}${event.params.tokenId}`);
  entity.disallowedNfts = nfts;

  entity.save();
}

export function handleNFTDisallowed(event: NFTDisallowed): void {
  let entity = fetchParams(event.address);

  const nfts = entity.disallowedNfts;
  nfts.push(`${event.params.collectionAddress.toHexString()}${event.params.tokenId}`);
  entity.disallowedNfts = nfts;

  entity.save();
}
