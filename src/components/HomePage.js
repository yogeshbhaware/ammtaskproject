import React, { useEffect, useState } from 'react'
import styled from 'styled-components'
import Web3 from "web3"
import { InjectedConnector } from '@web3-react/injected-connector';
import { spenderabi } from './../AMM-Task/JSON-FILE/spenderabi';
import { busdtokenabi } from './../AMM-Task/JSON-FILE/busdtokenabi';
import { busttokenabi } from '../AMM-Task/JSON-FILE/busttokenabi';
import { pairabi } from './../AMM-Task/JSON-FILE/pairabi';
import {
  bustTokenAddress,
  busdTokenAddress,
  pairAddress,
  spenderAddress
} from './../AMM-Task/addresses'
import { useWeb3React } from '@web3-react/core';
import { connector } from './Menu';

const web3 = new Web3(Web3.givenProvider);
const provider = window.ethereum;
const pairContract = new web3.eth.Contract(pairabi, pairAddress);
const spenderContract = new web3.eth.Contract(spenderabi, spenderAddress);
const busdTokenContract = new web3.eth.Contract(busdtokenabi, busdTokenAddress)
const bustTokenContract = new web3.eth.Contract(busttokenabi, bustTokenAddress)


export const injected = new InjectedConnector({
  supportedChainIds: [1, 3, 4, 5, 42, 56, 97]
})


function HomePage() {
  const slippage = 0.5;
  const deadline = Math.floor(new Date().getTime() / 1000) + 900;
  const [isWalletConnected , setIsWalletConnected] = useState(false);
  const [toggle , setToggle] = useState(1);
  const [userAddress , setUserAddress] = useState("")
  const [busd , setBusd] = useState("")
  const [bust , setBust] = useState("")
  const [busdBalance , setBusdBalance] = useState("")
  const [bustBalance , setBustBalance] = useState("")
  const [reserve0 , setReserves0] = useState();
  const [reserve1 , setReserves1] = useState("")
  const [approveadd , setApproveAdd] = useState(false)
  const [approveremove , setApproveRemove] = useState(false)
  const [lpRBalance , setLpRBalance] = useState("");
  const [busdRBalance , setBusdRBalance] = useState("")
  const [bustRBalance , setBustRBalance] = useState("")
  const [remove , setRemove] = useState({
    totalLpBalanceRemove:"",
    busdBalanceRemove:"",
    bustBalanceRemove:""
  })
  const [swapBUSD , setSwapBusd] = useState("")
  const [swapBUST , setSwapBust] = useState("")
  const [tokenforSWap , setTokenForSwap] = useState("")
  const [approveforSwap , setApproveForSwap] = useState(false)
  const [oneBusd , setOneBusd] = useState("")
  const [oneBust , setOneBust] = useState("");

  const { activate, deactivate, account, chainId , active} = useWeb3React();



  const fetchReservesFromContract = async () => {
    try{
      const reserves = await pairContract.methods.getReserves().call();
      setReserves0(reserves._reserve0)
      setReserves1(reserves._reserve1)
      console.log("fetchReservcesFromContract Succesfull",reserves)
    } catch (err){
        console.log("fetchReservesFromContract error",err)
    }
  }


  const getUserAddress = async () => {
    const accounts = await provider.request({
      method:"eth_requestAccounts",
    })
    const accountAdress = accounts[0];
    setUserAddress(accountAdress)
  }

  const onConnectedRightNetwork = async () => {
    setIsWalletConnected(true);
    await getUserAddress();

    await fetchReservesFromContract();
  }

  

  const getbustBalance = async () => {
    try{
      const bustBalance = await bustTokenContract.methods
      .balanceOf(account).call();
      setBustBalance(
        Number(web3.utils.fromWei(bustBalance)).toFixed(2).toString()
      );
    }catch(err){
      console.log("getbustBalance error",err)
    }
  }

  const getbusdBalance = async () => {
    try{
      const busdBalance = await busdTokenContract.methods.balanceOf(account)
      .call();
      setBusdBalance(Number(web3.utils.fromWei(busdBalance)).toFixed(2).toString());

    }catch (err){
      console.log("getbusdBalance line 53",err)
    }
  }

  const getLpBalance = async () => {
    const LpBalance = await pairContract.methods.balanceOf(userAddress)
    .call();
    console.log("getLpBalance",LpBalance);
    return LpBalance;
  }

  const getTotalSupply = async () => {
    const lpBalance = await getLpBalance();
    const totalSupply = await pairContract.methods.totalSupply().call();
    const busdBalance =  ((reserve0/totalSupply) * lpBalance).toString();
    const bustBalance = ((reserve1/totalSupply) * lpBalance).toString();
    setLpRBalance(Number(web3.utils.fromWei(lpBalance).toString()).toFixed(4))
    setBusdRBalance(Number(web3.utils.fromWei(busdBalance)).toFixed(4))
    setBustRBalance(Number(web3.utils.fromWei(bustBalance)).toFixed(4))
  }


  useEffect(()=> {
    const provider = localStorage.getItem("provider");
    if(provider) {
      activate(connector[provider])
      switchEthereumChain();
      onConnectedRightNetwork();
    }
  },[])



  useEffect(()=> {
    if(active){ 
      console.log("wallet is Active")
      getbusdBalance();
      getbustBalance();
      getTotalSupply();
    }
  },[active,reserve0])


  const fetchQuoteFromSpender = async (amountA , reserveA , reserveB ) => {
    try{
      const spenderAmount = await spenderContract.methods
      .quote(web3.utils.toWei(amountA), reserveA , reserveB).call();
      console.log("fetchQuoteFromSpender",web3.utils.fromWei(spenderAmount))
      return web3.utils.fromWei(spenderAmount);
    } catch( err) {
      console.log("fetchQuoteFromSpender error",err)
    }
  }



  const handleBustChange = async (e) => {
    const input = e.target.value;
    console.log("BUST",input)
    setApproveAdd(false)
    setBust(input)
    // setBusd(input*oneBust)
    if(input!==''){
      const busd = await fetchQuoteFromSpender(input , reserve1 , reserve0);
      setBusd(busd);
    }else{
      setBusd('')
    }
   
    
  }



  const handleBusdChange = async (e) => {

    const input = e.target.value;
    console.log("BUSD", input)
    setBusd(input)
    setApproveAdd(false)
    // setBust(input*oneBusd)
    if(input!==''){
      const bust = await fetchQuoteFromSpender(input , reserve0 , reserve1);
    setBust(bust);
    }else{
      setBust('')
    }
    
  }

  const ApproveToken = async (e) => {
    e.preventDefault();
    if(!busd || !bust){
      alert("Please fill the token amount")
    }else{
      const tokenApproval1 = await appprove0();
      const tokenApproval2 = await approve1();
      if(tokenApproval1 && tokenApproval2){
        setApproveAdd(true);
      }
    }
  }

  const addLiquidityHandler = async (e) => {
    e.preventDefault()
    const amountAmin = busd - (slippage / 100) * busd;
    const amountBmin = bust - (slippage / 100) * bust;
    try{
    const addLiquidity = await spenderContract.methods
    .addLiquidity(
      busdTokenAddress,
      bustTokenAddress,
      web3.utils.toWei(busd.toString()),
      web3.utils.toWei(bust.toString()),
      web3.utils.toWei(amountAmin.toString()),
      web3.utils.toWei(amountBmin.toString()),
      userAddress,
      deadline
    ).send({from:userAddress});
    console.log("addLiquidityHandler" , addLiquidity)
    if(addLiquidity){
      setBusd("")
      setBust("")
      setApproveAdd(false);
      getbusdBalance();
      getbustBalance();
      getTotalSupply();
    }else{
      alert("UserRejected Request")
    }
    }catch (err){
      alert("Liquidity Request Failed")
      console.log("addLiquidityHandler",err)
    }
  }

  const ApprovetoRemove = async (e) => {
    e.preventDefault();
    try{
      let approve = await pairContract.methods
      .approve(spenderAddress , web3.utils.toWei(lpRBalance.toString()))
      .send({
        from:userAddress
      });
      if(approve){
        setApproveRemove(true);
      }
      return approve;

    }catch (error){
      console.log("Approve to Remove",error)

    }
  }



  const percentCal = (e) => {
    console.log("percentCal called",e)
    const Lp = (e/100) * lpRBalance;
    const busd = (e/100) * busdRBalance;
    const bust = (e/100) * bustRBalance;
    if(lpRBalance && busdRBalance && bustRBalance ){
      setRemove({
        totalLpBalanceRemove:Number(Lp).toFixed(4),
        busdBalanceRemove:Number(busd).toFixed(4),
        bustBalanceRemove:Number(bust).toFixed(4),
      })
    }else{
      setRemove({
        totalLpBalanceRemove:lpRBalance,
        busdBalanceRemove:busdRBalance,
        bustBalanceRemove:bustRBalance,
      })
    }
    setApproveRemove(false);
  }

  const appprove0 = async () => {
    try {
      const value = web3.utils.toWei(busd.toString());
      const approveToken0 = await busdTokenContract.methods
      .approve(spenderAddress , value)
      .send({from:userAddress});
      console.log("approve 0 succesfull")
      return approveToken0;
    } catch (error) {
      console.log("approve0 address", error)
    }
  }


  const approve1 = async () => {
    try{
      const approveToken1 = await bustTokenContract.methods
      .approve(spenderAddress , web3.utils.toWei(bust.toString()))
      .send({from:userAddress})
      return approveToken1;
    } catch (error) {
      console.log("apprval1 amount error", error)
    }
  }

  const switchEthereumChain = async () => {
    try {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: '0x61' }],
      });
    } catch (e) {
      if (e.code == 4902) {
        try {
          await window.ethereum.request({
            method: "wallet_addEthereumChain",
            params: [
              {
                chainId: "0x61",
                chainName: "Smart Chain - Testnet",
                nativeCurrency: {
                  name: "Binance",
                  symbol: "BNB",
                  decimals: 18,
              },
              blockExplorerUrls: ["https://testnet.bscscan.com"],
              rpcUrls: ["https://data-seed-prebsc-1-s1.binance-org:8545/"],
          },
        ],
});
      } catch (error) {
  console.log(error)
}
    }
    // alert("Permission Has Been Denied");
  }
}

const approveSwap = async (e) => {
  e.preventDefault();
 if(!swapBUSD && !swapBUST){
   alert("Please Enter the Swap Value")
 }else{
  try{
    const approve = await busdTokenContract.methods
    .approve(
      spenderAddress,
      web3.utils.toWei(swapBUSD.toString())
    )
    .send({
      from:userAddress,
    })
    if(approve){
      setApproveForSwap(true)
    }
  }catch(err) {
    console.log("approveBusd for Swap",err)
  }
 }
}

const swapLiquidityHandler = async (e) => {
  e.preventDefault()
  try{
    if(tokenforSWap == 0) {
      const firstToken = await spenderContract.methods
      .swapExactTokensForTokens(
        web3.utils.toWei(swapBUSD.toString()),
        web3.utils.toWei(swapBUST.toString()),
        [busdTokenAddress , bustTokenAddress],
        userAddress,
        deadline
      )
      .send({from:userAddress})
      if(firstToken){
        setSwapBusd("")
        setSwapBust("")
        getbusdBalance()
        getbustBalance()
        getTotalSupply()
        setApproveForSwap(false)
        alert("Swap has been Done")
      }else{
        alert("Request is Rejected")
      }
  
    }else{
      const secondToken = await spenderContract.methods
      .swapTokensForExactTokens(
        web3.utils.toWei(swapBUST.toString()),
        web3.utils.toWei(swapBUSD.toString()),
        [busdTokenAddress  , bustTokenAddress],
        userAddress,
        deadline
      )
      .send({from:userAddress});
  
      if(secondToken){
        setSwapBusd("")
        setSwapBust("")
        getbusdBalance()
        getbustBalance()
        getTotalSupply()
        setApproveForSwap(false)
        alert("Swap has been Completed")
      }else{
        alert("Request is Rejected")
      }
    }

  }catch(err){
    alert("Error Thrown")
    console.log("Request Failed for Swap")
  }
  
  
}

const swapBusdHandleChange = async (e) => {
  const input  = e.target.value;
  console.log("SWAPA",input)
  setTokenForSwap(0)
  setSwapBusd(input)
  if(input!==''){
    const swapvalue = await spenderContract.methods.getAmountsOut(web3.utils.toWei(input.toString()),
    [busdTokenAddress,
    bustTokenAddress])
    .call()
    console.log("SWAPBUST",swapvalue)
    setSwapBust(web3.utils.fromWei(swapvalue[1].toString()));
  }else{
    setSwapBust('');
  }
  
 
}

const swapBustHandleChange = async (e) => {
  const input  = e.target.value;
  console.log("BUST",input)
  setSwapBust(input)
  setTokenForSwap(1);
  if(input!==""){
    const swapvalue = await spenderContract.methods
  .getAmountsIn(web3.utils.toWei(input.toString()), [
    busdTokenAddress,
    bustTokenAddress,
  ]).call()
  console.log("SWAPBUSD",swapvalue)
  setSwapBusd(web3.utils.fromWei(swapvalue[0].toString()));
  }else{
    setSwapBusd('')
  }
}

const removeLiquidityHandler = async (e) => {
  e.preventDefault();
  const amountAmin = remove.busdBalanceRemove - (slippage / 100) * remove.busdBalanceRemove;
  const amountBmin = remove.bustBalanceRemove - (slippage / 100) * remove.bustBalanceRemove;
  try{
    const removevalue = await spenderContract.methods
    .removeLiquidity(
      busdTokenAddress,
      bustTokenAddress,
      web3.utils.toWei(remove.totalLpBalanceRemove.toString()),
      web3.utils.toWei(amountAmin.toString()),
      web3.utils.toWei(amountBmin.toString()),
      userAddress,
      deadline
    ).send({from:userAddress})
    console.log("remove Liquidity Handler", removevalue)
    if(removevalue){
      alert("Liquidity Removed")
      getbusdBalance()
      getbustBalance()
      setApproveRemove(false)
      setRemove({
        totalLpBalanceRemove:"",
        busdBalanceRemove:"",
        bustBalanceRemove:''
      })
      getTotalSupply()
    }else{
      alert("User Rejected Request")
      setRemove({
        totalLpBalanceRemove:"",
        busdBalanceRemove:"",
        bustBalanceRemove:''
      })
    }

  }catch(err) {
    console.log("removeLiquidutyHandler",err)
    alert("Remove Liquidity Failed")
  }
}



return (
  <StyledHomePage>
    <MainContainer>
      <Container>
        <Box>
          <Buttons>
            <Button onClick={() => { setToggle(1) }}>Add</Button>
            <Button onClick={() => { setToggle(2) }}>Remove</Button>
            <Button onClick={() => { setToggle(3) }}>Swap</Button>
          </Buttons>
          {(() => {
            switch (toggle) {
              case 1:
                return (
                  <>
                    <Form onSubmit={addLiquidityHandler}>
                      <InputContainer>
                        <div
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between'
                          }}>
                          <div style={{ padding: "5px" }}>
                            <Token>Busd</Token>
                          </div>
                          <div style={{ padding: "5px" }}>
                            <BalanceValue>Balance : {!busdBalance ? "" : busdBalance}  </BalanceValue>
                          </div>
                        </div>
                        <Input
                          placeholder="0.00"
                          type="number"
                          value={busd}
                          onChange={handleBusdChange}
                        ></Input>
                      </InputContainer>
                      <InputContainer>
                        <div style={{
                          display: 'flex',
                          justifyContent: 'space-between'
                        }}>
                          <div style={{ padding: "5px" }}>
                            <Token>Bust</Token>
                          </div>
                          <div style={{ padding: "5px" }}>
                            <BalanceValue>Balance :{!bustBalance ? "" : bustBalance} </BalanceValue>
                          </div>
                        </div>
                        <Input
                          placeholder="0.00"
                          type="number"
                          value={bust}
                          onChange={handleBustChange}
                         
                        ></Input>
                      </InputContainer>
                      <DataContainer>
                        <Data>
                          <Text>Slippage Tolerance: 0.5%</Text>
                        </Data>
                        <Data>
                          <Text>Transaction deadline: 15 min</Text>
                        </Data>

                      </DataContainer>
                      <DataContainer>
                        <Data><Text>1BUSD = 2.495727 BUST</Text></Data>
                        <Data>
                          <Text>1BUST = 0.400685 BUSD</Text>
                        </Data>
                      </DataContainer>
                      <DataContainer>
                        <Button onClick={ApproveToken}>Approve Tokens</Button>
                      </DataContainer>
                      
                  {approveadd &&    <DataContainer>
                        <Button>Add Supply</Button>
                      </DataContainer>}
                      

                    </Form>

                  </>
                );
              case 2:
                return (
                  <>
                    <Buttons>
                      <ButtonNUM onClick={()=>{percentCal(25)}}>25%</ButtonNUM>
                      <ButtonNUM onClick={()=>{percentCal(50)}}>50%</ButtonNUM>
                      <ButtonNUM onClick={()=>{percentCal(75)}}>75%</ButtonNUM>
                      <ButtonNUM onClick={()=>{percentCal(100)}}>Max</ButtonNUM>
                    </Buttons>
                    <TokenContainer>
                      <TokenText>Pooled Token</TokenText>
                      <SmallContainer>
                        <div style={{
                          display: "flex",
                          justifyContent: "space-between"
                        }}>
                          <Field>{lpRBalance ? lpRBalance: "------" }</Field>
                          <Field>BUST-LP</Field>
                        </div>
                      </SmallContainer>
                      <SmallContainer>
                        <div style={{
                          display: "flex",
                          justifyContent: "space-between"
                        }}>
                          <Field>{busdRBalance ? busdRBalance :"------"}</Field>
                          <Field>BUSD</Field>
                        </div>
                      </SmallContainer>
                      <SmallContainer>
                        <div style={{
                          display: "flex",
                          justifyContent: "space-between"
                        }}>
                          <Field>{bustRBalance? bustRBalance :"------"}</Field>
                          <Field>BUST</Field>
                        </div>
                      </SmallContainer>
                    </TokenContainer>
                    <TokenContainer>
                      <TokenText>Selected Token</TokenText>
                      <SmallContainer>
                        <div style={{
                          display: "flex",
                          justifyContent: "space-between"
                        }}>
                          <Field>{ remove.totalLpBalanceRemove? remove.totalLpBalanceRemove :"------"}</Field>
                          <Field>BUST-LP</Field>
                        </div>
                      </SmallContainer>
                      <SmallContainer>
                        <div style={{
                          display: "flex",
                          justifyContent: "space-between"
                        }}>
                          <Field>{remove.busdBalanceRemove? remove.busdBalanceRemove :"------"}</Field>
                          <Field>BUSD</Field>
                        </div>
                      </SmallContainer>
                      <SmallContainer>
                        <div style={{
                          display: "flex",
                          justifyContent: "space-between"
                        }}>
                          <Field>{remove.bustBalanceRemove? remove.bustBalanceRemove :"------"}</Field>
                          <Field>BUST</Field>
                        </div>
                      </SmallContainer>
                    </TokenContainer>
                    <DataContainer>
                      <Button onClick={ApprovetoRemove}>Approve</Button>
                    </DataContainer>
                    { approveremove &&<DataContainer>
                      <Button onClick={removeLiquidityHandler}> Remove Liquidity</Button>
                    </DataContainer>}                  </>
                );
              case 3:
                return (
                  <>
                    <Form>
                      <InputContainer>
                        <div
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between'
                          }}>
                          <div style={{ padding: "5px" }}>
                            <Token>From</Token>
                          </div>
                          <div style={{ padding: "5px" }}>
                            <BalanceValue>Balance :{!busdBalance ? "" : busdBalance}</BalanceValue>
                          </div>
                        </div>
                        <Input
                          placeholder="0.00"
                          type="number"
                          value={swapBUSD}
                          onChange={swapBusdHandleChange}
                        ></Input>
                      </InputContainer>
                      <InputContainer>
                        <div style={{
                          display: 'flex',
                          justifyContent: 'space-between'
                        }}>
                          <div style={{ padding: "5px" }}>
                            <Token>To</Token>
                          </div>
                          <div style={{ padding: "5px" }}>
                            <BalanceValue>Balance : {!bustBalance ? "" : bustBalance}</BalanceValue>
                          </div>
                        </div>
                        <Input
                          placeholder="0.00"
                          type="number"
                          value={swapBUST}
                          onChange={swapBustHandleChange}
                        ></Input>
                      </InputContainer>
                      <DataContainer>
                        <Data>
                          <Text>Slippage Tolerance: 0.5%</Text>
                        </Data>
                        <Data>
                          <Text>Transaction deadline: 15 min</Text>
                        </Data>

                      </DataContainer>
                      <DataContainer>
                        <Data><Text>1BUSD = 2.495727 BUST</Text></Data>
                        <Data>
                          <Text>1BUST = 0.400685 BUSD</Text>
                        </Data>
                      </DataContainer>
                      <DataContainer>
                        <Button onClick={approveSwap}>Approve </Button>
                      </DataContainer>
                     { approveforSwap && <DataContainer>
                        <Button onClick={swapLiquidityHandler}>Swap Liquidity</Button>
                      </DataContainer>}

                    </Form>

                  </>
                );
                default:
                  return(<></>)
            }
          })()}

        </Box>
      </Container>
    </MainContainer>

  </StyledHomePage>
)
}

const DataContainer = styled.div`
  width:100%;
  margin:20px;
  display:flex;
  flex-direction:column;
  text-align:center;
`
const Text = styled.span`
  color:rgb(40,13,95);
  font-weight:bold;`

const Data = styled.div``

const StyledHomePage = styled.div`
    min-height:100vh;
    width:100vw;
    display:flex;
    
    background-color:#283c34;
    justify-content: center;
    align-items:center;
    `
const MainContainer = styled.div`
justify-content: center;
align-items:center;
display:flex;
margin:40px;

@media screen and (max-width : 790px){
  width: 90%;
}

`
const Container = styled.div`
  display:flex;
  justify-content:center;
  flex-direction:column;
  width:400px;
  border:3px solid #eedde4;

  border-radius:5px;
  background:#f7eef1;
  box-shadow: inset 0 0 10px grey , 0 0 10px grey;`

const Buttons = styled.div`
  width:100%;
  display:flex;
  justify-content:space-evenly;
  border-radius:8px;
  margin:20px;
`

const Box = styled.div`
height:auto;
width:90%;
position:relative;
 
`

const Form = styled.form`

`

const InputContainer = styled.div`
  width:100%;
  display:flex;
  flex-direction:column;
  justify-content:center;
  margin:20px;
  border-radius:8px;
  background-color:rgb(238,234,244);
  box-shadow:0 0 10px black;
`
const Input = styled.input`
color:rgb(40,13,95);
padding:10px;
border:none;
outline: none !important;
border-radius:8px;
background-color:rgb(238,234,244);`


const Token = styled.div`
color:rgb(40,13,95)
`

const BalanceValue = styled.div`
color:rgb(40,13,95)`

const Button = styled.button`
  padding:10px;
  border-radius:5px;
  background-color:#283c34;
  border : hsl(317  , 100% , 54%) 1px solid;
  color:hsl(317 , 100% , 54%);
  text-shadow:0 0 0.125em hsl(0 0% 100%/0.5) ,0 0 0.45em hsl(317 , 100% , 54%);
  box-shadow:inset 0 0 1em 0 hsl(317 , 100% , 54%) ,0 0 1em 0 hsl(317 , 100% , 54%);  
`

const ButtonNUM = styled.button`
  border:none;
  padding:10px;
  color:hsl(317 , 100% , 54%);
  background-color:#283c34;
  text-shadow:0 0 0.125em hsl(0 0% 100%/0.5) ,0 0 0.45em hsl(317 , 100% , 54%);
  border-radius:5px;
  border : hsl(317  , 100% , 54%) 1px solid;
  box-shadow:inset 0 0 1em 0 hsl(317 , 100% , 54%);
`

const TokenContainer = styled.div`
  width:100%;
  display:flex;
  flex-direction:column;
  justify-content:center;
  margin:20px;
  border-radius:8px;
  background-color:rgb(238,234,244);
  box-shadow:0 0 10px black;`

const TokenText = styled.span`
  text-align:center;
  color:rgb(40,13,95);
  margin-top:5px;`

const SmallContainer = styled.span`
  display:flex;
  flex-direction:column;
  justify-content:space-between;`


const Field = styled.div`
  padding:5px;
  color:rgb(40,13,95);
`





export default HomePage