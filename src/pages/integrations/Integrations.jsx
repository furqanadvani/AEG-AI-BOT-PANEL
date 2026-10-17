import { useEffect, useState } from "react";
import { Alert, Button, Drawer, Skeleton, Switch, Tag, Tooltip } from "antd";
import { ApiOutlined, EditOutlined } from "@ant-design/icons";
import { Form, Formik } from "formik";
import { useDispatch, useSelector } from "react-redux";
import { ContainerWrapper } from "../../containers";
import { FormBuilder } from "../../components";
import { getIntegrations, saveIntegration, testIntegration } from "../../store/actions/Integrations.action";
import { useACL } from "../../utils/acl/UseACL";
import { ACL_ACCESS_LIST, ACL_MODULES } from "../../utils/acl/Index";
import { fromNow } from "../../utils/Methods";
import { INTEGRATION_META, ORDER, schemaFor, toForm, toPayload } from "./Helper";
import "./Integrations.css";

const Integrations = () => {
  const dispatch = useDispatch();
  const { can } = useACL();
  const { list, listLoading, savingType, testingType, testResults } = useSelector(({ integrations }) => integrations);
  const [editing, setEditing] = useState(null);
  const canUpdate = can(ACL_MODULES.INTEGRATIONS, ACL_ACCESS_LIST.UPDATE);

  useEffect(() => {
    dispatch(getIntegrations());
  }, [dispatch]);

  const items = ORDER.map((t) => list.find((i) => i.type === t)).filter(Boolean);

  // Secret fields: masked value placeholder mein, khali chhorne par purana rahe
  const formFields = (item) =>
    INTEGRATION_META[item.type].fields.map((f) =>
      f.secret ? { ...f, placeholder: get(item, f.name) ? `${get(item, f.name)} (leave empty to keep)` : "Not set" } : f
    );

  return (
    <ContainerWrapper pageHeaderProps={{ title: "Integrations", subtitle: "Keys and settings for external services. Secrets are encrypted and never shown in full." }}>
      {listLoading && !list.length ? (
        <Skeleton active paragraph={{ rows: 6 }} />
      ) : (
        <div className="integration-grid">
          {items.map((item) => {
            const meta = INTEGRATION_META[item.type];
            const test = testResults[item.type];
            return (
              <section key={item.type} className="section-card integration-card">
                <div className="integration-card-head">
                  <div>
                    <div className="integration-card-title">{meta.title}</div>
                    <p className="text-gray text-small" style={{ marginTop: 4 }}>{meta.description}</p>
                  </div>
                  <Tag color={item.isEnabled ? "green" : "default"} className="status-tag">{item.isEnabled ? "On" : "Off"}</Tag>
                </div>

                <div className="d-flex gap-5 flex-wrap">
                  <Tooltip title={item.source === "env" ? "Currently using values from .env. Saving here switches to the database values" : "Saved in the database"}>
                    <Tag>{item.source === "env" ? "From .env" : "Saved here"}</Tag>
                  </Tooltip>
                  {item.provider && <Tag>{item.provider}</Tag>}
                  {item.lastTestAt && (
                    <Tag color={item.lastTestOk ? "green" : "red"}>
                      {item.lastTestOk ? "Test passed" : "Test failed"} {fromNow(item.lastTestAt)}
                    </Tag>
                  )}
                </div>

                {meta.help && <p className="mono text-gray">{meta.help}</p>}
                {test && !test.ok && <Alert type="error" showIcon title={test.error || "Connection failed"} />}
                {test?.ok && <Alert type="success" showIcon title="Connection successful" />}

                <div className="integration-card-foot">
                  {canUpdate && (
                    <>
                      <Button icon={<ApiOutlined />} loading={testingType === item.type} onClick={() => dispatch(testIntegration(item.type))}>Test</Button>
                      <Button type="primary" icon={<EditOutlined />} onClick={() => setEditing(item)}>Configure</Button>
                    </>
                  )}
                </div>
              </section>
            );
          })}
        </div>
      )}

      <Drawer open={!!editing} onClose={() => setEditing(null)} size={560} title={editing && `Configure ${INTEGRATION_META[editing.type].title}`} destroyOnHidden>
        {editing && (
          <Formik
            initialValues={toForm(editing)}
            validationSchema={schemaFor(editing.type)}
            onSubmit={(v) => dispatch(saveIntegration(editing.type, toPayload(editing.type, v), () => setEditing(null)))}
          >
            {({ values, setFieldValue }) => (
              <Form>
                <div className="section-card d-flex justify-between align-item-center margin-bottom-16" style={{ padding: "12px 16px" }}>
                  <div>
                    <div className="font-semibold">Enabled</div>
                    <div className="text-gray text-small">Off = the system will not use this service</div>
                  </div>
                  <Switch checked={values.isEnabled} onChange={(v) => setFieldValue("isEnabled", v)} aria-label="Enabled" />
                </div>
                <FormBuilder fields={formFields(editing)} />
                <div className="flex-end gap-10">
                  <Button onClick={() => setEditing(null)}>Cancel</Button>
                  <Button type="primary" htmlType="submit" loading={savingType === editing.type}>Save</Button>
                </div>
              </Form>
            )}
          </Formik>
        )}
      </Drawer>
    </ContainerWrapper>
  );
};

const get = (obj, path) => path.split(".").reduce((o, k) => o?.[k], obj);

export default Integrations;
