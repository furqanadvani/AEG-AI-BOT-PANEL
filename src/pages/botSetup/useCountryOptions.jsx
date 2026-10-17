import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getCountries } from "../../store/actions/Countries.action";
import { getVisaTypes } from "../../store/actions/VisaTypes.action";
import { useACL } from "../../utils/acl/UseACL";
import { ACL_ACCESS_LIST, ACL_MODULES } from "../../utils/acl/Index";

/** "ALL" + countries (aur visa types) ke options: VisaTypes/Questions/Knowledge/Agents forms ke liye */
export const useScopeOptions = ({ withVisaTypes = false } = {}) => {
  const dispatch = useDispatch();
  const { can } = useACL();
  const countries = useSelector(({ countries }) => countries.list);
  const visaTypes = useSelector(({ visaTypes }) => visaTypes.list);

  useEffect(() => {
    if (can(ACL_MODULES.COUNTRIES, ACL_ACCESS_LIST.VIEW)) dispatch(getCountries({ limit: 200, sort: "name" }));
    if (withVisaTypes && can(ACL_MODULES.VISA_TYPES, ACL_ACCESS_LIST.VIEW)) dispatch(getVisaTypes({ limit: 200 }));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const countryOptions = [{ value: "ALL", label: "All countries" }, ...countries.map((c) => ({ value: c.name, label: c.name }))];
  const visaTypeOptions = [{ value: "ALL", label: "All visa types" }, ...[...new Set(visaTypes.map((v) => v.name))].map((n) => ({ value: n, label: n }))];
  return { countryOptions, visaTypeOptions };
};

export const scopeLabel = (v, all) => (!v || v === "ALL" ? <span className="text-gray">{all}</span> : v);
