import React, { useEffect, useState } from 'react'
import styled from 'styled-components'
import {FaTimes} from 'react-icons/fa'
import { InjectedConnector } from '@web3-react/injected-connector'
import { WalletConnectConnector } from '@web3-react/walletconnect-connector'
import { useWeb3React } from '@web3-react/core'

import cbw from './../images/cbw.png'
import mm from './../images/mm.png'
import wc from './../images/wc.png'

const WalletConnect = new WalletConnectConnector({
  url:`https://ropsten.infura.io/v3/eb75055fc8424bb39410fbe413fb5bff`,
  bridge:'https://bridge.walletconnect.org',
  qrcode:true,

})

const Injected = new InjectedConnector({
  supportedChainIds:[1,3,4,5,42,56,97]
});


export const connector = {
  Injected:Injected,
  WalletConnect: WalletConnect
}

function Menu({setModal}) {
  const {activate , deactivate , active} = useWeb3React();
  console.log("this is active Wallet ",active)

 
  const setProvider = (type) => {
    localStorage.setItem("provider",type);

  }


 

  return (
    <StyledMenu>
        <div onClick={()=>{setModal(false)}}><CloseToggle/></div>
        <Cards>
          <Card onClick={()=>{setModal(false)}}>
            <Image
            src={cbw}
            alt="Coinbase Wallet Logo"/>
            <Text>Coinbase Wallet</Text>
          </Card>
          <Card onClick={()=>{setModal(false);activate(WalletConnect);setProvider("WalletConnect");}}>
            <Image
            src={wc}
            alt="Wallet Connect Logo"/>
            <Text>Wallet Connector</Text>
          </Card>
          <Card onClick={()=>{setModal(false); activate(Injected);setProvider("Injected");}}>
            <Image
            src={mm}
            alt="Metamask Logo"/>
            <Text>Metamask</Text>
          </Card>
        </Cards>
    </StyledMenu>
  )
}

const Cards = styled.div`
  display:flex;
  margin:40px 40px;
  flex-direction:column;
  ;
  flex-wrap:wrap;`

const Card = styled.div`
  width:100%;
  cursor:pointer;
  display:flex;
  margin:10px;
  height:70px;
  border:1px solid #ccc;
  box-shadow: 2px 2px 6px 0 rgba(0,0,0,0.3);
  &:hover{
    background:hsl(190, 66% , 95%);
    box-shadow:inset 0 0 2px 0 hsl(317 , 100% , 54%) ,0 0 2px 0 hsl(317 , 100% , 54%);
  }
`

const Image = styled.img`
  height:40px;
  width:40px;
  margin:20px;

`

const Text = styled.h2`
  color:black;
`

const StyledMenu = styled.div`
    position:fixed;
    top:0;
    right:0;
    height:100vh;
    width:100%;
    @media screen and (min-width : 790px){
        width: 30%;
    }
    background-color: rgba(255, 255, 255, .95);
    z-index:99;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    `

const CloseToggle = styled(FaTimes)`
    position:fixed;
    top:5%;
    right:4%;
    border : hsl(317  , 100% , 54%) 4px solid;
    background: hsl(323, 21% , 16%);
    color:hsl(317 , 100% , 54%);
    padding: .75rem;
    display: flex;
    place-items: center;
    font-size: 2rem;
    cursor:pointer;
    text-shadow:0 0 0.125em hsl(0 0% 100%/0.5) ,0 0 0.45em hsl(317 , 100% , 54%);
    box-shadow:inset 0 0 1em 0 hsl(317 , 100% , 54%) ,0 0 1em 0 hsl(317 , 100% , 54%);`



export default Menu