import { Address, toNano } from '@ton/core';
import { SimpleNftCollection } from '../wrappers/SimpleNftCollection';
import { NetworkProvider, sleep } from '@ton/blueprint';
import { NftItem } from '../wrappers/SimpleNftItem';

export async function run(provider: NetworkProvider, args: string[]) {
    const ui = provider.ui();

    const address = Address.parse(args.length > 0 ? args[0] : await ui.input('SimpleNftUsual address'));

    if (!(await provider.isContractDeployed(address))) {
        ui.write(`Error: Contract at address ${address} is not deployed!`);
        return;
    }

    const simpleNftCollection = provider.open(SimpleNftCollection.fromAddress(address));

    const dataInfo = await simpleNftCollection.getGetCollectionData();
    let nftAddress = await simpleNftCollection.getGetNftAddressByIndex(1n);
    console.log("Found address: ", nftAddress);

    /* await simpleNftCollection.send(
        provider.sender(),
        {
            value: toNano('1.5'),
        },
        "Mint"
    ); */
    
    if (nftAddress) {
        const simpleNftITem = provider.open(NftItem.fromAddress(nftAddress));
        const nftData = await simpleNftITem.getGetNftData();
        console.log("Individual data: ", nftData);
    } else {
        console.log("Where is address?");
    }

    let dataInfoAfter = await simpleNftCollection.getGetCollectionData();
    let attempt = 1;

    console.log("Changes: ", dataInfo, dataInfoAfter)

    ui.clearActionPrompt();
    ui.write('Counter increased successfully!');
}
