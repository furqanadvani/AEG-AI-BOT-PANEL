import MEMBERS from "../constant/Members.constant";
import { createCrudActions } from "../../utils/ReduxHelpers";

const crud = createCrudActions(MEMBERS, "/members", { label: "Member" });

export const { getList: getMembers, save: saveMember, setStatus: setMemberStatus } = crud;
