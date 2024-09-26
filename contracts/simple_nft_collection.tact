import "@stdlib/deploy";
import "./message.tact";
import "./nft_item.tact";

const nftBalanceConst: Int = ton("0.1");

contract SimpleNftCollection with Deployable {

    next_item_index: Int as uint32 = 0;
    collection_index: Int as uint32 = 0;
    owner_address: Address?;
    master_address: Address;
    royalty_params: RoyaltyParams?;                      
    collection_content: Cell?;   
    individual_content_url: Cell?;
    mint_limit: Int = 0;
    price: Int = 0;
    is_setup: Bool;

    init(
    master_address: Address,
    collection_index: Int){
        require(sender() == master_address, "Not from master");
        self.collection_index = collection_index;
        self.master_address = master_address;
        self.is_setup = false;
    }

    receive(msg: CollectionSetupParams) {
        require(sender() == self.master_address, "Not from master");
        require(self.is_setup == false, "Collection settings is already setup");
        self.price = msg.nft_price;
        self.mint_limit = msg.mint_limit;
        self.owner_address = msg.owner_address;
        self.royalty_params = msg.royalty_params;
        self.collection_content = msg.collection_content;
        self.individual_content_url = msg.nft_individual_content_url;
        self.is_setup = true;
    }

    receive("Mint"){
        require(self.is_setup == true, "Collection settings is not setup");
        let ctx: Context = context(); // get sender Info
        if (self.mint_limit > 0) {
            require(self.next_item_index <= self.mint_limit, "Mint limit reached");
        }
        require(ctx.value >= self.price, "NFT creation underpriced");
        let msgValue: Int = ctx.value;
        let tonBalanceBeforeMsg: Int = myBalance() - msgValue;
        let storageFee: Int = minTonsForStorage - min(tonBalanceBeforeMsg, minTonsForStorage);
        msgValue = msgValue - (storageFee + gasConsumption);
        
        self.mint(ctx.sender, msgValue);

        emit(LogEventMintRecord{ minter: sender(), item_id: self.next_item_index, generate_number: nativeRandom() }.toCell());
    }

    // ===== Private Methods ===== //

        fun mint(sender: Address, msgValue: Int) {
        require(self.next_item_index >= 0, "non-sequential NFTs");
        let nft_init: StateInit = self.getNftItemInit(self.next_item_index);
        let feeValue = msgValue - nftBalanceConst;

        send(SendParameters{
                to: contractAddress(nft_init), 
                value: nftBalanceConst, 
                bounce: false,
                mode: SendIgnoreErrors,
                body: Transfer {
                    query_id: 0,
                    new_owner: sender,
                    response_destination: self.owner_address,
                    custom_payload: self.individual_content_url,
                    forward_amount: 0,
                    forward_payload: emptySlice()
                }.toCell(),
                code: nft_init.code,
                data: nft_init.data
            });

        send(SendParameters{
            to: self.master_address,
            value: (feeValue * 3) / 100
        });

        send(SendParameters{
            to: self.owner_address!!,
            value: (feeValue * 97) / 100
        }); 
        dump(self.next_item_index); // Reference at: https://tact-by-example.org/03-emit
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
                destination: (self.royalty_params!!).destination
            }.toCell()
        });        
    }

    get fun get_master_data(): CollectionMasterData {
        return CollectionMasterData{
            master: self.master_address,
            mint_limit: self.mint_limit,
            price: self.price
        }
    }

    // ------------------ Get Function  ------------------ //
    get fun get_collection_data(): CollectionData {     
        let b: StringBuilder = beginString();
        let collectionDataString: String = (self.collection_content!!).asSlice().asString();
        b.append(collectionDataString);
        return CollectionData{
            next_item_index: self.next_item_index, 
            collection_content: b.toCell(), 
            owner_address: self.owner_address!!
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

