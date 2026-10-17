import QUERIES from "../constant/Queries.constant";
import { patch } from "../../utils/ApiMethods";
import { apiRequest, createCrudActions } from "../../utils/ReduxHelpers";

const crud = createCrudActions(QUERIES, "/queries", { label: "Query" });

export const { getList: getQueries, save: saveQuery, remove: deleteQuery } = crud;

/** { answer, status, addToKnowledge, topic } */
export const answerQuery = (id, payload, CB) => (dispatch) =>
  apiRequest({ dispatch, type: QUERIES.ANSWER, call: () => patch(`queries/${id}/answer`, payload), success: true, CB });
