import QUESTIONS from "../constant/Questions.constant";
import { createCrudActions } from "../../utils/ReduxHelpers";

const actions = createCrudActions(QUESTIONS, "/questions", { label: "Question" });

export const {
  getList: getQuestions,
  getDetail: getQuestionDetail,
  save: saveQuestion,
  setStatus: setQuestionStatus,
  remove: deleteQuestion,
  bulk: bulkQuestions,
} = actions;

export default actions;
