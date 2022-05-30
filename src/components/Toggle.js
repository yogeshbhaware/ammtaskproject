import React, { useState } from 'react'
import styled from 'styled-components'
import { useWeb3React } from '@web3-react/core'

function Toggle() {
  const {active , deactivate} = useWeb3React();
  
 

  return (<>
    {active ? <StyledToggle > Wallet Connected</StyledToggle> : <StyledToggle > Connect Wallet</StyledToggle>}
    </>
  )
}

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

export default Toggle;