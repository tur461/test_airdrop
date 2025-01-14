/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react-hooks/rules-of-hooks */
import Table from "react-bootstrap/Table";
import Pagination from "react-bootstrap/Pagination";
import Button from "react-bootstrap/Button";
import InputGroup from "react-bootstrap/InputGroup";
import Form from "react-bootstrap/Form";
import { useEffect, useState } from "react";
import "./style.css";
import { CSV_FILE_URL } from "../../constants";
import {isAddress} from 'ethers'

const SenderTable = (props) => {
  let indexOfLastItem;
  let indexOfFirstItem;
  let currentItems;
  const { wallets, setWallets, isConnected, setInvalidRecipients } = props;
  const { currentPage, setCurrentPage } = useState(1);
  const [itemPerPage] = useState(5);

  useEffect(() => {
    indexOfLastItem = currentPage * itemPerPage;
    indexOfFirstItem = indexOfLastItem - itemPerPage;
    currentItems = wallets && wallets.slice(indexOfFirstItem, indexOfLastItem);
  }, [wallets, currentPage]);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };
  const uploadWallet = async (e) => {
    const response = await fetch(CSV_FILE_URL);
    const data = await response.text();
    const dataArray = data.replace(/\s/g, "").split(",");
    
    let invRecipients = [], validRecipients = [];
    
    for(let i=0, len = dataArray.length, item=''; i<len && (item = dataArray[i]); ++i) {
      console.log(item)
      if(isAddress(item)) validRecipients.push(item)
      else invRecipients.push(item)
    }
  
    validRecipients.length && setWallets(validRecipients);
    invRecipients.length && setInvalidRecipients(invRecipients)
  };

  return (
    <div>
      <Table responsive>
        <thead>
          <tr>
            <th>No</th>
            <th>Valid Recipients</th>
          </tr>
        </thead>
        <tbody>
          {wallets && wallets.length > 0
            ? wallets.map((e, idx) => {
                return (
                  <tr>
                    <td>{idx + 1}</td>
                    <td>{e}</td>
                  </tr>
                );
              })
            : "No data"}
        </tbody>
      </Table>

      {/* <Pagination>
        {[
          ...Array(Math.ceil(wallets && wallets.length / itemPerPage)).key(),
        ].map(
          // eslint-disable-next-line array-callback-return
          (number) => {
            <Pagination.Item
              key={number + 1}
              active={number + 1 === currentPage}
              onClick={() => handlePageChange(number + 1)}
            >
              {number + 1}
            </Pagination.Item>;
          }
        )}
      </Pagination> */}

      <div className="tableButton">
        <Button
          className="uploadButton"
          disabled={!isConnected}
          onClick={uploadWallet}
        >
          Load CSV File
        </Button>
        {/* <InputGroup className="addButton">
          <Form.Control
            placeholder="New Wallet Address"
            aria-label="Recipient's username"
            aria-describedby="basic-addon2"
            aria-disabled={!isConnected}
          />
          <Button variant="primary" id="button-addon2" disabled={!isConnected}>
            Add
          </Button>
        </InputGroup> */}
      </div>
    </div>
  );
};

export default SenderTable;
