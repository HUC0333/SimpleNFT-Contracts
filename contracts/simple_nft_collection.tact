import "@stdlib/deploy";
import "./message.tact";
import "./nft_item.tact";

contract SimpleNftCollection with Deployable {

    next_item_index: Int as uint32 = 0;
    owner_address: Address;
    master_address: Address;
    royalty_params: RoyaltyParams?;                      
    collection_content: Cell;   
    individual_content_url: String;
    price: Int;

    init(
    owner_address: Address, 
    master_address: Address,
    collection_content: Cell, 
    nft_individual_content_url: String,
    nft_price: Int,
    royalty_params: RoyaltyParams){
        self.owner_address = owner_address;
        self.master_address = master_address;
        self.collection_content = collection_content; 
        self.royalty_params = royalty_params;
        self.individual_content_url = nft_individual_content_url;
        self.price = nft_price;
    }

    receive("Mint"){
        let ctx: Context = context(); // get sender Info
        let msgValue: Int = ctx.value;
        require(context().value >= self.price, "NFT creation underpriced");
        let tonBalanceBeforeMsg: Int = myBalance() - msgValue;
        let storageFee: Int = minTonsForStorage - min(tonBalanceBeforeMsg, minTonsForStorage);
        msgValue = msgValue - (storageFee + gasConsumption);

        let masterFee = (msgValue * 3) / 100;
        let collectionOwnerFee = ((msgValue * 97) / 100) - (storageFee + gasConsumption + minTonsForStorage);
        
        send(SendParameters{
            to: self.master_address,
            value: masterFee
        });

        send(SendParameters{
            to: self.owner_address,
            value: collectionOwnerFee
        });

        self.mint(ctx.sender, minTonsForStorage);

        emit(LogEventMintRecord{ minter: sender(), item_id: self.next_item_index, generate_number: nativeRandom() }.toCell());
    }

    // ===== Private Methods ===== //
    fun mint(sender: Address, msgValue: Int) {
        require(self.next_item_index >= 0, "non-sequential NFTs");
        let ctx: Context = context(); // get sender Info
        // let msgValue: Int = ctx.value;
        let nft_init: StateInit = self.getNftItemInit(self.next_item_index);
        let contentBuilder: StringBuilder = beginString();
        let contentUrl: String = self.individual_content_url.asSlice().asString();
        contentBuilder.append(contentUrl);

        send(SendParameters{
                to: contractAddress(nft_init), 
                value: msgValue, 
                bounce: false,
                mode: SendIgnoreErrors,
                body: Transfer {
                    query_id: 0,
                    new_owner: sender,
                    response_destination: self.owner_address,
                    custom_payload: contentBuilder.toCell(),
                    forward_amount: 0,
                    forward_payload: emptySlice()
                }.toCell(),
                code: nft_init.code,
                data: nft_init.data
            });
        // dump(self.next_item_index); // Reference at: https://tact-by-example.org/03-emit
        self.next_item_index = self.next_item_index + 1;
    }

    receive(msg: GetRoyaltyParams) {   
        let ctx: Context = context(); // get sender Info
        send(SendParameters{
            to: ctx.sender,
            value: 0,
            mode: 64, 
            bounce: false,
            body: ReportRoyaltyParams {
                query_id: msg.query_id,
                numerator:  (self.royalty_params!!).numerator,
                denominator: (self.royalty_params!!).denominator,
                destination: self.owner_address
            }.toCell()
        });        
    }

    // ------------------ Get Function  ------------------ //
    get fun get_collection_data(): CollectionData {     
        let b: StringBuilder = beginString();
        let collectionDataString: String = self.collection_content.asSlice().asString();
        b.append(collectionDataString);
        return CollectionData{
            next_item_index: self.next_item_index, 
            collection_content: b.toCell(), 
            owner_address: self.owner_address
        };
    }

    get fun get_nft_address_by_index(item_index: Int): Address?{      
        let initCode: StateInit = self.getNftItemInit(item_index);
        return contractAddress(initCode);
    }

    get fun getNftItemInit(item_index: Int): StateInit {
        return initOf NftItem(myAddress(), item_index);
    }
    
    get fun get_nft_content(index: Int, individual_content: Cell): Cell { 
        let b: StringBuilder = beginString();
        let ic: String = individual_content.asSlice().asString();
        b.append(ic);
        return b.toCell();
    }

    get fun royalty_params(): RoyaltyParams {
        return self.royalty_params!!;
    }
}

