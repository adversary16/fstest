import { useParams } from "react-router";
import ValidateAccess from "./ValidateAccess";

function GenerateValidator(){
    let { chatId }  = useParams();
    return <ValidateAccess path = { chatId }/>
  }
export default GenerateValidator