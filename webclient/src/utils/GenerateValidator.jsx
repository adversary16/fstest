import { useParams } from "react-router";
import ValidateAccess from "./ValidateAccess";

function GenerateValidator(){
    let { chatId }  = useParams();
    return <ValidateAccess location = { chatId }/>
  }
export default GenerateValidator