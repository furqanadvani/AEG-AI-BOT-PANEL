import { Button, Modal } from "antd";
import { Form, Formik } from "formik";
import FormBuilder from "./FormBuilder";

/**
 * Modal + Formik + FormBuilder. Add/Edit forms isi se:
 *   <FormModal open title initialValues validationSchema fields onSubmit loading />
 * children(formik) diya ho to fields ke neeche extra UI (e.g. permission matrix).
 */
const FormModal = ({ open, onClose, title, subtitle, initialValues, validationSchema, fields = [], onSubmit, loading = false, submitText = "Save", width = 640, single, children }) => (
  <Modal open={open} onCancel={() => !loading && onClose()} footer={null} width={width} destroyOnHidden maskClosable={!loading} title={title}>
    {subtitle && <p className="text-gray margin-bottom-16">{subtitle}</p>}
    <Formik initialValues={initialValues} validationSchema={validationSchema} onSubmit={onSubmit} enableReinitialize>
      {(formik) => (
        <Form noValidate>
          <FormBuilder fields={fields} single={single} />
          {typeof children === "function" ? children(formik) : children}
          <div className="form-modal-footer">
            <Button onClick={onClose} disabled={loading}>Cancel</Button>
            <Button type="primary" htmlType="submit" loading={loading}>{submitText}</Button>
          </div>
        </Form>
      )}
    </Formik>
  </Modal>
);

export default FormModal;
