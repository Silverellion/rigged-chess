import React from "react";
import "./logbox.css";
import arrowLeft from "../../assets/images/icons/arrow_left.svg";
import arrowLeftDouble from "../../assets/images/icons/arrow_left_double.svg";
import arrowRight from "../../assets/images/icons/arrow_right.svg";
import arrowRightDouble from "../../assets/images/icons/arrow_right_double.svg";

const Logbox: React.FC = () => {
  return (
    // prettier-ignore
    <div className="grid grid-rows-[4fr_1fr]">
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

      <div className="button-tray">
        <button><img src={arrowLeftDouble} alt="arrowLeftDouble" /></button>
        <button><img src={arrowLeft} alt="arrowLeft" /></button>
        <button><img src={arrowRight} alt="arrowRight" /></button>
        <button><img src={arrowRightDouble} alt="arrowRightDouble" /></button>
      </div>
    </div>
  );
};

export default Logbox;
