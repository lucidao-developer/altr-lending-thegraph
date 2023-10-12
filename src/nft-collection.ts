import { fetchNft } from "./utils";
import { Transfer } from "../generated/templates/NftCollection/NftCollection";
import { Event, Loan } from "../generated/schema";

export function handleTransfer(event: Transfer): void {
  const nftId = `${event.address.toHexString()}${event.params.tokenId}`;
  const toUser = event.params.to.toHexString();

  let nft = fetchNft(nftId);
  nft.collection = event.address.toHexString();
  nft.tokenId = event.params.tokenId;
  nft.owner = toUser;
  const loans = nft.loans || [];

  nft.save();

  for (let i = 0; i < loans!.length; i++) {
    let loan = Loan.load(loans![i]);
    if (loan!.status == "REQUESTED") {
      loan!.status = "CANCELLED";
      loan!.save();

      let ev = new Event(event.transaction.hash.toHexString());
      ev.eventType = "CANCELLED";
      ev.time = event.block.timestamp;
      ev.transactionHash = event.transaction.hash;
      ev.loan = loan!.id;
      ev.save();
    }
  }
}
