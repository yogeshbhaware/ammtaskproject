import './App.css';
import HomePage from './components/HomePage';
import Menu from './components/Menu';
import Toggle from './components/Toggle';
import { useEffect, useState } from 'react';
import styled from 'styled-components';
import { useWeb3React } from '@web3-react/core';
import { disconnect } from 'process';

function App() {
  const {active , account, deactivate} = useWeb3React();
  const [modal , setModal] = useState(false)

  const disconnect = () => {
    localStorage.removeItem('provider');
    deactivate()
  }
 
  return (
    <div className="App">
      <StyledToggle onClick={()=>{setModal(true)}}>{active ? "Connected: " + String(account).substring(0,6) + "..." : "Connect Wallet"}</StyledToggle>
      {active?  <StyledToggleD onClick={disconnect}>Disconnet Wallet</StyledToggleD> : ""}
      {modal ? <Menu setModal={setModal}/> : ""}
      <HomePage/>
    </div>
  );
}

const Button = styled.button`
margin: 1px;
`
const StyledToggle = styled.button`
    position: fixed;
    top: 5%;
    right: 4%;
    color:hsl(317 , 100% , 54%);
    background: hsl(323, 21% , 16%);
    padding: .75rem;
    display:flex;
    border : hsl(317  , 100% , 54%) 4px solid;
    place-items: center;
    font-size: 1rem;
    cursor: pointer;
    border-radius:0.30em;
    text-shadow:0 0 0.125em hsl(0 0% 100%/0.5) ,0 0 0.45em hsl(317 , 100% , 54%);
    box-shadow:inset 0 0 1em 0 hsl(317 , 100% , 54%) ,0 0 1em 0 hsl(317 , 100% , 54%);`

  const StyledToggleD = styled.button`
  position: fixed;
  top: 5%;
  left: 4%;
  color:hsl(317 , 100% , 54%);
  background: hsl(323, 21% , 16%);
  padding: .75rem;
  display:flex;
  border : hsl(317  , 100% , 54%) 4px solid;
  place-items: center;
  font-size: 1rem;
  cursor: pointer;
  border-radius:0.30em;
  text-shadow:0 0 0.125em hsl(0 0% 100%/0.5) ,0 0 0.45em hsl(317 , 100% , 54%);
  box-shadow:inset 0 0 1em 0 hsl(317 , 100% , 54%) ,0 0 1em 0 hsl(317 , 100% , 54%);
  
  `

export default App;
