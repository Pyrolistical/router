import React from "react";
import {
  createHistory,
  createMemorySource,
  Router,
  LocationProvider,
  Link
} from "./index";
import renderer from "react-test-renderer";

let snapshot = ({ pathname, element }) => {
  let testHistory = createHistory(createMemorySource(pathname));
  let wrapper = renderer.create(
    <LocationProvider history={testHistory}>{element}</LocationProvider>
  );
  const tree = wrapper.toJSON();
  expect(tree).toMatchSnapshot();
  return tree;
};

let runWithNavigation = (element, pathname = "/") => {
  let history = createHistory(createMemorySource(pathname));
  let wrapper = renderer.create(
    <LocationProvider history={history}>{element}</LocationProvider>
  );
  const snapshot = string => {
    expect(wrapper.toJSON()).toMatchSnapshot();
  };
  return { history, snapshot, wrapper };
};

let Home = () => <div>Home</div>;
let Dash = ({ children }) => <div>Dash {children}</div>;
let Group = ({ groupId, children }) => (
  <div>
    Group: {groupId}
    {children}
  </div>
);
let PropsPrinter = props => <pre>{JSON.stringify(props, null, 2)}</pre>;
let Reports = ({ children }) => <div>Reports {children}</div>;
let AnnualReport = () => <div>Annual Report</div>;

describe("smoke tests", () => {
  it(`renders the root component at "/"`, () => {
    snapshot({
      pathname: "/",
      element: (
        <Router>
          <Home path="/" />
          <Dash path="/dash" />
        </Router>
      )
    });
  });

  it("renders at a path", () => {
    snapshot({
      pathname: "/dash",
      element: (
        <Router>
          <Home path="/" />
          <Dash path="/dash" />
        </Router>
      )
    });
  });
});

describe("passed props", () => {
  it("parses dynamic segments and passes to components", () => {
    snapshot({
      pathname: "/group/123",
      element: (
        <Router>
          <Home path="/" />
          <Group path="/group/:groupId" />
        </Router>
      )
    });
  });

  it("passes the matched URI to the component", () => {
    snapshot({
      pathname: "/groups/123/users/456",
      element: (
        <Router>
          <PropsPrinter path="/groups/:groupId/users/:userId" />
        </Router>
      )
    });
  });

  it("shadows params in nested paths", () => {
    snapshot({
      pathname: `/groups/burger/groups/milkshake`,
      element: (
        <Router>
          <Group path="groups/:groupId">
            <Group path="groups/:groupId" />
          </Group>
        </Router>
      )
    });
  });

  it("parses multiple params when nested", () => {
    const Group = ({ groupId, children }) => (
      <div>
        {groupId}
        {children}
      </div>
    );
    const User = ({ userId, groupId }) => (
      <div>
        {groupId} - {userId}
      </div>
    );
    snapshot({
      pathname: `/group/123/user/456`,
      element: (
        <Router>
          <Group path="group/:groupId">
            <User path="user/:userId" />
          </Group>
        </Router>
      )
    });
  });
});

describe("route ranking", () => {
  const Root = () => <div>Root</div>;
  const Groups = () => <div>Groups</div>;
  const Group = ({ groupId }) => <div>Group Id: {groupId}</div>;
  const MyGroup = () => <div>MyGroup</div>;
  const MyGroupsUsers = () => <div>MyGroupUsers</div>;
  const Users = () => <div>Users</div>;
  const UsersSplat = ({ splat }) => <div>Users Splat: {splat}</div>;
  const User = ({ userId, groupId }) => (
    <div>
      User id: {userId}, Group Id: {groupId}
    </div>
  );
  const Me = () => <div>Me!</div>;
  const MyGroupsAndMe = () => <div>Mine and Me!</div>;
  const Fiver = ({ one, two, three, four, five }) => (
    <div>
      Fiver {one} {two} {three} {four} {five}
    </div>
  );

  const element = (
    <Router>
      <Root path="/" />
      <Groups path="/groups" />
      <Group path="/groups/:groupId" />
      <MyGroup path="/groups/mine" />
      <Users path="/groups/:groupId/users" />
      <MyGroupsUsers path="/groups/mine/users" />
      <UsersSplat path="/groups/:groupId/users/*" />
      <User path="/groups/:groupId/users/:userId" />
      <Me path="/groups/:groupId/users/me" />
      <MyGroupsAndMe path="/groups/mine/users/me" />
      <Fiver path="/:one/:two/:three/:four/:five" />
    </Router>
  );

  test("/", () => {
    snapshot({ element, pathname: "/" }); // Root
  });
  test("/groups", () => {
    snapshot({ element, pathname: "/groups" }); // Groups
  });
  test("/groups/123", () => {
    snapshot({ element, pathname: "/groups/123" }); // Group
  });
  test("/groups/mine", () => {
    snapshot({ element, pathname: "/groups/mine" }); // MyGroup
  });

  test("/groups/123/users", () => {
    snapshot({ element, pathname: "/groups/123/users" }); // Users
  });

  test("/groups/mine/users", () => {
    snapshot({ element, pathname: "/groups/mine/users" }); // MyGroupsUsers
  });

  test("/groups/123/users/456", () => {
    snapshot({ element, pathname: "/groups/123/users/456" }); // User
  });

  test("/groups/123/users/me", () => {
    snapshot({ element, pathname: "/groups/123/users/me" }); // Me
  });

  test("/groups/123/users/a/bunch/of/junk", () => {
    snapshot({
      element,
      pathname: "/groups/123/users/a/bunch/of/junk"
    }); // UsersSplat
  });

  test("/groups/mine/users/me", () => {
    snapshot({ element, pathname: "/groups/mine/users/me" }); // MyGroupsAndMe
  });

  test("/one/two/three/four/five", () => {
    snapshot({ element, pathname: "/one/two/three/four/five" }); // Fiver
  });
});

describe("nested rendering", () => {
  it("renders a nested path", () => {
    snapshot({
      pathname: "/dash/reports",
      element: (
        <Router>
          <Home path="/" />
          <Dash path="/dash">
            <Reports path="reports" />
          </Dash>
        </Router>
      )
    });
  });

  it("renders a really nested path", () => {
    snapshot({
      pathname: "/dash/reports/annual",
      element: (
        <Router>
          <Home path="/" />
          <Dash path="/dash">
            <Reports path="reports">
              <AnnualReport path="annual" />
            </Reports>
          </Dash>
        </Router>
      )
    });
  });

  it("renders a child 'index' nested path", () => {
    snapshot({
      pathname: "/dash",
      element: (
        <Router>
          <Home path="/" />
          <Dash path="/dash">
            <Reports path="/" />
          </Dash>
        </Router>
      )
    });
  });

  it("yo dawg", () => {
    snapshot({
      pathname: "/",
      element: (
        <Router>
          <Dash path="/">
            <Dash path="/">
              <Dash path="/" />
            </Dash>
          </Dash>
        </Router>
      )
    });
  });

  it("matches multiple nested / down to a child with a path", () => {
    snapshot({
      pathname: "/yo",
      element: (
        <Router>
          <Dash path="/">
            <Dash path="/">
              <Dash path="/yo" />
            </Dash>
          </Dash>
        </Router>
      )
    });
  });
});

describe("disrespect", () => {
  it("has complete disrespect for leading and trailing slashes", () => {
    snapshot({
      pathname: "dash/reports/annual/",
      element: (
        <Router>
          <Home path="/" />
          <Dash path="dash">
            <Reports path="/reports/">
              <AnnualReport path="annual" />
            </Reports>
          </Dash>
        </Router>
      )
    });
  });
});

describe("links", () => {
  it("renders links with relative hrefs", () => {
    const Parent = ({ children }) => (
      <div>
        <h1>Parent</h1>
        <Link to="reports">/dash/reports</Link>
        {children}
      </div>
    );

    const Child = () => (
      <div>
        <h2>Child</h2>
        <Link to="../">/dash</Link>
      </div>
    );

    snapshot({
      pathname: "/dash/reports",
      element: (
        <Router>
          <Parent path="dash">
            <Child path="reports" />
            <Child path="charts" />
          </Parent>
        </Router>
      )
    });
  });
});

describe("transitions", () => {
  it("transitions pages", async () => {
    const { snapshot, history: { navigate } } = runWithNavigation(
      <Router>
        <Home path="/" />
        <Reports path="reports" />
      </Router>
    );
    snapshot();
    await navigate("/reports");
    snapshot();
  });

  it("keeps the stack right on interrupted transitions", async () => {
    const {
      snapshot,
      history,
      history: { navigate }
    } = runWithNavigation(
      <Router>
        <Home path="/" />
        <Reports path="reports" />
        <AnnualReport path="annual-report" />
      </Router>
    );
    navigate("/reports");
    await navigate("/annual-report");
    snapshot();
    expect(history.index === 1);
  });
});

describe("nested routers", () => {
  it("allows arbitrary Router nesting through context", () => {
    const PageWithNestedApp = () => (
      <div>
        Home
        <ChatApp />
      </div>
    );

    const ChatApp = () => (
      <Router>
        <ChatHome path="/home" />
      </Router>
    );

    const ChatHome = () => <div>Chat Home</div>;

    snapshot({
      pathname: `/chat/home`,
      element: (
        <Router>
          <PageWithNestedApp path="/chat/*" />
        </Router>
      )
    });
  });
});
