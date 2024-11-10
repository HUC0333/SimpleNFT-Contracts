import { Address, beginCell, toNano } from '@ton/core';
import { NftCollection } from '../wrappers/UsualNftCollection';
import { NetworkProvider } from '@ton/blueprint';
import { SimpleNftMaster } from '../wrappers/SimpleNftMaster';

export async function run(provider: NetworkProvider) {
    const ui = provider.ui();
    const contractAddress = await ui.input('Contract address:');
    const to = await ui.input('To address:');

    const contract = provider.open(SimpleNftMaster.fromAddress(Address.parse(contractAddress)));

    await contract.send(
        provider.sender(),
        {
            value: toNano('0.1'),
        },
        {
            $$type: "Withdraw",
            to: Address.parse(to)
        }
    );

    const newData = await contract.getGetMasterData();
    console.log("Updated data:", newData);
}