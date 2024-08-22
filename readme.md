# [Tonspack](https://tonspack.com/) web3auth JWT middleware 

This repo is about the open source JWT middleware of Tonspack wallet telegram webapp MPC auth .

Base on [Web3auth](https://www.web3auth.io/) customer JWT keypair management system .

You can try some **Demo** about this MPC wallet service here : 

[Basic MPC Test](https://t.me/tonspack_bot/mpc)

[Wallet Service](https://t.me/tonspack_bot/mpc)

## Basic functions :

- #### /try
    
    - Redirect to `/do` and pack the telegram.webapp.initData into Base64 .

- ### /do
    
    - Do telegram.webapp.initData.sign singature auth . 

    - Get JWT with user information .

    - Redirect to main Dapp with JWT token .

## Risk and TODO
    
As a MPC wallet . Currently the major problem of Web3auth customer MPC system is : `Still depends on a centralized middleware` .

So basically speaking . if, i means if , i work with evil , still makes me ,the wallet provider , easy to reach user's privateKey . 

May be we can slove this issues better in future .

