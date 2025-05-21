import React from "react";
import "./logbox.css";

const Logbox: React.FC = () => {
  return (
    // prettier-ignore
    <>
      <table className="log-table">
        <tbody>
          <tr>
            <td>1.</td>
            <td><a href="">e4</a></td>
            <td><a href="">e5</a></td>
          </tr>
          <tr>
            <td>2.</td>
            <td><a href="">Nf3</a></td>
            <td><a href="">Nc6</a></td>
          </tr>
        </tbody>
      </table>
    </>
  );
};

export default Logbox;
