# AEG Visa Admin (frontend)

Vite + React + antd + Redux (thunk). Backend: `Backend/` (Node, Express, MongoDB).

## Chalana

```bash
npm install
cp .env.example .env        # VITE_API_URL = backend ka URL (/api tak)
npm run dev                 # http://localhost:5173
npm run build               # dist/
```

Backend `.env` mein `CLIENT_URL=http://localhost:5173` hona chahiye (CORS), aur login ke liye `npm run create-admin` se super admin.

## Folder structure (reference repo jaisa)

```
src/
  assets/          logo
  components/      reusable: CrudPage, FormBuilder/FormModal, PermissionMatrix, ChatThread,
                   PageHeader, CountCards, ActionButtons, NotificationDrawer, Loader, UserAvatar
  containers/      PageWrapper (rail + header), ContainerWrapper (page header + body)
  pages/           har screen ka folder
  routes/          RouteConfig (saare pages + rail groups + ACL), Protected, Auth
  store/
    constant/      X.constant.jsx
    actions/       X.action.jsx
    reducers/      X.reducer.jsx  (+ index)
  uiComponents/    CInput, CSelect, CTextarea, CSwitch, CTable, CField
  utils/           ApiMethods, Interceptor, Methods, Constants, Theme, ReduxHelpers, acl/
```

## Naya page / module kaise add karein

1. `store/constant/X.constant.jsx`: `createConstants("X")`
2. `store/actions/X.action.jsx`: `createCrudActions(X, "/x", { label: "X" })`
3. `store/reducers/X.reducer.jsx`: `createCrudReducer(X)` aur `reducers/index.jsx` mein add
4. `pages/x/X.jsx`: `<CrudPage storeKey="x" actions={actions} module={ACL_MODULES.X} columns fields schema />`
5. `routes/RouteConfig.jsx` mein ek line: `{ path, Component, group, nav, acl }`

Rail, page-header tabs aur route guard khud ban jate hain.

## Styling

- Saari base styling `utils/Theme.jsx` (antd tokens). Components mein colors / radius dobara nahi likhne.
- Global tokens + utilities sirf `App.css` mein (`--them-*` reference wale naam).
- Form label / error ki CSS sirf `uiComponents/cField/CField.css`.

## ACL

User ke role ki permissions (`auth.user.role.permissions`) se:
- Rail aur tabs mein sirf allowed pages
- Buttons (`can(ACL_MODULES.LEADS, ACL_ACCESS_LIST.UPDATE)`)
- Route par direct jaane se 403 page

Backend phir bhi har request check karta hai.
