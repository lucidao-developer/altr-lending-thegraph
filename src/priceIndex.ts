import { ValuationAdded, CollectionRegistered } from "../generated/PriceIndex/PriceIndex";
import { Collection, Nft, Valuation } from "../generated/schema";

export function handleCollectionRegistered(event: CollectionRegistered): void {
  const collectionId = event.params.collectionAddress.toHexString();
  let collection = Collection.load(collectionId);
  if (collection == null) {
    collection = new Collection(collectionId);
  }
  collection.address = event.params.collectionAddress;
  collection.oracle = event.params.oracleRole;
  collection.save();
}

export function handleValuationAdded(event: ValuationAdded): void {
  const collectionId = event.params.collectionAddress.toHexString();
  const nftId = `${collectionId}${event.params.nftId}`;
  const valuationId = `${nftId}${event.params.lastValuation.timestamp}`;
  const valuation = new Valuation(valuationId);
  valuation.price = event.params.lastValuation.price;
  valuation.ltv = event.params.lastValuation.ltv;
  valuation.timestamp = event.params.lastValuation.timestamp;

  let nft = Nft.load(nftId);

  if (nft == null) {
    nft = new Nft(nftId);
    nft.collection = collectionId;
    nft.tokenId = event.params.nftId;
  }

  let valuationHistory = nft.valuationHistory || [];
  valuationHistory!.push(valuationId);
  nft.valuationHistory = valuationHistory;

  nft.save();
  valuation.save();
}
