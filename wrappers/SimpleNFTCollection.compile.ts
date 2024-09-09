import { CompilerConfig } from '@ton/blueprint';

export const compile: CompilerConfig = {
    lang: 'tact',
    target: 'contracts/simple_nft_collection.tact',
    options: {
        debug: true,
    },
};
