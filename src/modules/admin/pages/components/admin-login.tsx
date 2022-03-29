import React from 'react';
import styled, { createGlobalStyle, keyframes } from 'styled-components';
import ReactDOM from 'react-dom';
import { LoginWelcomeLogo } from './login-welcome-logo';
import axios from 'axios';
import { ethers } from 'ethers';

const GlobalStyle = createGlobalStyle`
  html, body, #app {
    width: 100%;
    height: 100%;
    margin: 0;
    padding: 0;
    font-family: 'Roboto', sans-serif;
  }

  *, button {
    font-family: 'Roboto', sans-serif;
    outline: none;
    box-sizing: border-box;
  }
`;

const Wrapper = styled.section`
  display: flex;
  align-items: center;
  justify-content: center;s
  flex-direction: column;
  height: 100%;
  background: rgba(186, 202, 215, 0.2);
`;

const Content = styled.section`
  background: #fff;
  height: 440px;
  max-width: 860px;
  display: flex;
  margin: 0 auto;
  box-shadow: 0 15px 24px 0 rgb(137 138 154 / 15%);

  @media (max-width: 400px) {
    width: 100%;
    height 100%;
  }
`;

const LogoBox = styled.section`
  background: #4268f6;
  color: #fff;
  padding: 48px;
  width: 380px;
  flex-grow: 0;
  display: block;
  position: relative;

  @media (max-width: 900px) {
    display: none;
  }
`;

const LoginBox = styled.section`
  padding: 48px;
  width: 480px;
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100%;
  justify-content: flex-start;

  @media (max-width: 400px) {
    width: 100%;
    height 100%;
  }
`;

const Form = styled.form`
  width: 100%;
`;

const ErrorBox = styled.div`
  font-family: Roboto, sans-serif;
  font-size: 12px;
  line-height: 24px;
  font-weight: 400;
  background: rgba(242, 74, 51, 0.35);
  border: 1px solid #f24a33;
  padding: 8px;
  margin: 0px 0 16px 0;
  height: 40px;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
`;

const SubmitButton = styled.button` 
    font-size: 14px;
    background-color: transparent;
    -webkit-appearance: none;
    -moz-appearance: none;
    outline: 0;
    display: inline-block;
    font-family: 'Roboto',sans-serif;
    line-height: 24px;
    vertical-align: middle;
    border: 1px solid #4268F6;
    color: #4268F6;
    -webkit-text-decoration: none;
    text-decoration: none;
    padding: 4px 32px;
    box-sizing: border-box;
    background-color: #4268F6;
    color: #fff;
    border-color: transparent;
    cursor: pointer;
    display: flex;
   align-items: center;
    
    svg {
      width: auto;
      height: 1.5em;
      path {
        fill: white
      }
    }

  &:hover {
    color: #fff;
    background: #535B8E;
    border-color: #535B8E;
  }
  
  &:focus {
  border-color: #38CAF1;
  box-shadow: 0 1px 4px 0 rgb(56 202 241 / 58%);
`;

const ButtonWrapper = styled.div`
  text-align: center;
  margin-top: 12px;
  gap: 12px;
  display: flex;
  justify-content: center;
`;

const rotate360 = keyframes`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
`;

const Spinner = styled.div`
  margin-top: 50px;
  animation: ${rotate360} 1s linear infinite;
  transform: translateZ(0);
  border-top: 3px solid rgba(66, 104, 246, 0.8);
  border-right: 3px solid rgba(66, 104, 246, 0.8);
  border-bottom: 3px solid rgba(66, 104, 246, 0.8);
  border-left: 6px solid #4268f6;
  background: transparent;
  width: 80px;
  height: 80px;
  border-radius: 50%;
`;

const H2 = styled.h2`
  font-family: 'Roboto', sans-serif;
  vertical-align: middle;
  padding: 0;
  font-weight: 200;
  font-size: 32px;
  line-height: 40px;
  margin-top: 4px;
  margin-bottom: 32px;
`;

const Description = styled.div`
  font-family: 'Roboto', sans-serif;
  font-size: 14px;
  line-height: 24px;
  font-weight: 300;
  font-weight: 200;
  margin-top: 8px;
`;

const Logo = styled.img`
  margin-bottom: 32px;
  max-width: 200px;
  margin-top: 0px;
  margin-bottom: 40px;
  display: flex;
  align-self: baseline;
  margin-top: 12px;
`;

export const AdminLogin = () => {
  const [error, setError] = React.useState('');
  const [loading, setLoading] = React.useState(false);

  const onLogin = React.useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const message = 'Sign here to login to Jump!\nLogin nonce: ' + window.nonce;

      const provider = new ethers.providers.Web3Provider(window.ethereum);
      provider.on('network', (newNetwork, oldNetwork) => {
        if (oldNetwork) {
          window.location.reload();
        }
      });
      const addresses = await provider.send('eth_requestAccounts', []);
      const signed = await provider.getSigner().signMessage(message);
      await axios.post('/admin/login', {
        address: addresses[0],
        message,
        signed,
      });
      window.location.reload();
    } catch (error) {
      if (error.response.data?.message) {
        setError(error.response.data.message);
      }
      setLoading(false);
    }
  }, []);

  return (
    <>
      <GlobalStyle />
      <Wrapper>
        <Content>
          <LogoBox>
            <div>
              <H2>Welcome</H2>
              <Description>
                To AdminJS - the best admin framework for Node.js apps, based on React.
              </Description>
              <div>
                <LoginWelcomeLogo />
              </div>
            </div>
          </LogoBox>
          <LoginBox>
            <Logo src="/logo.svg" alt="Jump.co" />
            {error && <ErrorBox>{error}</ErrorBox>}
            {loading ? (
              <Spinner />
            ) : (
              <>
                <Form>
                  <ButtonWrapper>
                    <SubmitButton type="button" onClick={onLogin}>
                      Login with wallet
                    </SubmitButton>
                  </ButtonWrapper>
                </Form>
              </>
            )}
          </LoginBox>
        </Content>
      </Wrapper>
    </>
  );
};

declare global {
  interface Window {
    web3: any;
    ethereum: any;
    nonce: string;
  }
}

const mountNode = window.document.getElementById('app');
ReactDOM.render(<AdminLogin />, mountNode);
