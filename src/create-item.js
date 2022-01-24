import { ethers } from "ethers";

import React, { useState } from "react";

//import ShakaPlayer from "shaka-player-react";
//import ShakaPlayer from "shaka-player-react";

//import "../../styles/CIoverlay.css";

import { Button, TextareaAutosize } from "@material-ui/core";

import { create as ipfsHttpClient } from "ipfs-http-client";

import web3 from "web3";
import { useHistory } from "react-router";

import { nftaddress, nftmarketaddress } from "./config";

import NFT from "./artifacts/contracts/NFT.sol/NFT.json";
import Market from "./artifacts/contracts/NFTMarket.sol/NFTMarket.json";

const client = ipfsHttpClient("https://ipfs.infura.io:5001/api/v0");

export default function Home() {
  let history = useHistory();
  const [size, setSize] = useState(0);

  // Tab component
  const [value, setValue] = React.useState(0);

  // modal openings contexts
  const [txHash, setTxHash] = useState(null);

  // The minting and saving part of the code
  const [fileUrl, setFileUrl] = useState(null);
  const [formInput, updateFormInput] = useState({
    price: "",
    name: "",
    description: "",
  });

  // Calling smart contract functions
  async function createSale(url) {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();

    let contract = new ethers.Contract(nftaddress, NFT.abi, signer);
    let transaction = await contract.createToken(url);
    let tx = await transaction.wait();
    setTxHash(`https://mumbai.polygonscan.com/tx/${tx.transactionHash}`);
    console.log(txHash);
    let event = tx.events[0];
    let value = event.args[2];
    let tokenId = value.toNumber();
    const price = web3.utils.toWei(formInput.price, "ether");

    const listingPrice = web3.utils.toWei("0.01", "ether");

    contract = new ethers.Contract(nftmarketaddress, Market.abi, signer);
    transaction = await contract.createMarketItem(nftaddress, tokenId, price, {
      value: listingPrice,
    });

    await transaction.wait();

    // eslint-disable-next-line no-restricted-globals
    history.push("./Marketplace");
  }

  async function onChange(e) {
    const file = e.target.files[0];
    try {
      const added = await client.add(file, {
        progress: (prog) => {
          setSize(prog);
          console.log(`received: ${prog}`);
        },
      });
      const url = `https://ipfs.infura.io/ipfs/${added.path}`;
      setFileUrl(url);
    } catch (error) {
      console.log("Error uploading file: ", error);
    }
  }
  async function createMarket() {
    const { name, description, price } = formInput;
    if (!name || !description || !price || !fileUrl) return;

    console.log(name + " was created");
    // first, upload to IPFS
    const data = JSON.stringify({
      name,
      description,
      image: fileUrl,
    });
    try {
      // Uploading to ipfs
      const added = await client.add(data);
      const url = `https://ipfs.infura.io/ipfs/${added.path}`;
      createSale(url);
    } catch (err) {
      console.log("Error uploading file: ", err.message);
    }
  }

  return (
    <>
      <div>
        <div
          style={{
            backgroundColor: "#3e3e3e",
          }}
          className=" flex justify-center m-3.5 align-middle font-bold"
        >
          <>
            <div className="flex flex-row mt-6">
              <div
                className="mx-10 my-5"
                style={{ height: "450px", width: "450px" }}
              >
                {fileUrl && (
                  <img
                    alt=""
                    className="rounded mt-4 float-left"
                    width="500"
                    src={fileUrl}
                  />
                )}
              </div>

              <br />
              <div className="w-full justify-center">
                <div className="w-full flex flex-col pb-4">
                  <input
                    required
                    type="text"
                    placeholder="NFT Name"
                    className="mt-8 border rounded p-4 w-48"
                    onChange={(e) =>
                      updateFormInput({
                        ...formInput,
                        name: e.target.value,
                      })
                    }
                  />
                  <TextareaAutosize
                    required
                    placeholder="NFT Description"
                    className="mt-2 border rounded p-4"
                    onChange={(e) =>
                      updateFormInput({
                        ...formInput,
                        description: e.target.value,
                      })
                    }
                  />
                  <div className="flex flex-row">
                    <input
                      required
                      type="number"
                      placeholder="NFT Price in Matic"
                      className="mt-2 border rounded p-4 w-48"
                      onChange={(e) =>
                        updateFormInput({
                          ...formInput,
                          price: e.target.value,
                        })
                      }
                    />

                    <img
                      alt=""
                      height="50px"
                      width="50px"
                      src="https://www.cryptologos.cc/logos/polygon-matic-logo.svg?v=014"
                    />
                  </div>
                  <input
                    required
                    type="file"
                    name="NFT"
                    className="my-4 w-64"
                    onChange={onChange}
                  />

                  <br />
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={createMarket}
                    className="mt-4 bg-blue-500 text-white rounded p-4 shadow-lg"
                  >
                    Create NFT
                  </Button>
                </div>
              </div>
            </div>
          </>
        </div>
      </div>
    </>
  );
}
