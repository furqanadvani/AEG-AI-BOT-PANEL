import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getCurrencies } from "../../store/actions/Currencies.action";
import { useACL } from "../../utils/acl/UseACL";
import { ACL_ACCESS_LIST, ACL_MODULES } from "../../utils/acl/Index";

export const useCurrencyOptions = () => {
  const dispatch = useDispatch();
  const { can } = useACL();
  const list = useSelector(({ currencies }) => currencies.list);
  useEffect(() => {
    if (can(ACL_MODULES.CURRENCY, ACL_ACCESS_LIST.VIEW)) dispatch(getCurrencies());
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  return list.filter((c) => c.isActive).map((c) => ({ value: c._id, label: `${c.code} (${c.symbol})` }));
};

export const money = (v, cur) => (v === undefined || v === null ? "-" : `${cur?.symbol || cur?.code || ""} ${Number(v).toLocaleString(undefined, { maximumFractionDigits: cur?.decimalPlaces ?? 2 })}`.trim());
