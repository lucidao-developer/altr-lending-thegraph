import { NftCollection } from "../generated/templates";
import { CollectionCreated } from "../generated/NftCollectionFactory/NftCollectionFactory";
import { Collection } from "../generated/schema";

function getCollectionTypeFromName(name: string): string {
  return name
    .split("-")
    .at(-1)
    .trim();
}

export function handleCollectionCreated(event: CollectionCreated): void {
  NftCollection.create(event.params.contractAddress);
  let collection = new Collection(event.params.contractAddress.toHexString());
  collection.address = event.params.contractAddress;
  collection.name = event.params.collectionName;
  collection.type = getCollectionTypeFromName(event.params.collectionName);
  collection.save();
}
