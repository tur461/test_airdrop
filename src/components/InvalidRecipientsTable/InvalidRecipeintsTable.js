/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react-hooks/rules-of-hooks */
import Table from "react-bootstrap/Table";
import { useEffect, useState } from "react";
import "./style.css";

const InvalidRecipeintsTable = (props) => {
  let indexOfLastItem;
  let indexOfFirstItem;
  let currentItems;
  const { invalidRecipients } = props;
  const { currentPage, setCurrentPage } = useState(1);
  const [itemPerPage] = useState(5);

  useEffect(() => {
    indexOfLastItem = currentPage * itemPerPage;
    indexOfFirstItem = indexOfLastItem - itemPerPage;
    currentItems = invalidRecipients && invalidRecipients.slice(indexOfFirstItem, indexOfLastItem);
  }, [invalidRecipients, currentPage]);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  return (
    <div>
      <Table responsive>
        <thead>
          <tr>
            <th>No</th>
            <th>Invalid Recipients</th>
          </tr>
        </thead>
        <tbody>
          {invalidRecipients && invalidRecipients.length > 0
            ? invalidRecipients.map((e, idx) => {
                return (
                  <tr>
                    <td>{idx + 1}</td>
                    <td>{e}</td>
                  </tr>
                );
              })
            : ""}
        </tbody>
      </Table>
    </div>
  );
};

export default InvalidRecipeintsTable;
