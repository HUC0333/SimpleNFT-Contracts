import { CompilerConfig } from '@ton/blueprint';

export const compile: CompilerConfig = {
    lang: 'tact',
    target: 'contracts/simple_n_f_t_master.tact',
    options: {
        debug: true,
    },
};
