import { readYaml } from "../../common/util";
import _ from "lodash";
import path from "path";
import { OpenAPIV3, OpenAPI } from "openapi-types";
import { ConfigToType, DataSourcePlugin } from "openblocks-sdk/dataSource";
import { runOpenApi } from "../openApi";
import { parseOpenApi, ParseOpenApiOptions } from "../openApi/parse";

const spec = readYaml(path.join(__dirname, "./stripe.spec.yaml"));

const dataSourceConfig = {
  type: "dataSource",
  params: [
    {
      type: "groupTitle",
      key: "basicAuth",
      label: "HTTP Basic Auth",
    },
    {
      type: "textInput",
      key: "basicAuth.username",
      label: "Username",
      tooltip: "Basic auth username",
      placeholder: "<Basic Auth Username>",
    },
    {
      type: "password",
      key: "basicAuth.password",
      label: "Password",
      tooltip: "Basic auth password",
      placeholder: "<Basic Auth Password>",
    },
    {
      type: "groupTitle",
      key: "bearerAuth",
      label: "Api Token Auth",
    },
    {
      type: "password",
      key: "bearerAuth.value",
      label: "Token",
      tooltip: "Bearer HTTP authentication. Allowed headers-- Authorization: Bearer <api_key>",
      placeholder: "Bearer HTTP authentication. Allowed headers-- Authorization: Bearer <api_key>",
    },
  ],
} as const;

const parseOptions: ParseOpenApiOptions = {
  actionLabel: (method: string, path: string, operation: OpenAPI.Operation) => {
    return _.upperFirst(operation.operationId || "");
  },
};

type DataSourceConfigType = ConfigToType<typeof dataSourceConfig>;

const stripePlugin: DataSourcePlugin<any, DataSourceConfigType> = {
  id: "stripe",
  name: "Stripe",
  icon: "stripe.svg",
  category: "api",
  dataSourceConfig,
  queryConfig: async () => {
    const { actions, categories } = await parseOpenApi(spec, parseOptions);
    return {
      type: "query",
      label: "Action",
      categories: {
        label: "Category",
        items: categories,
      },
      actions,
    };
  },
  run: function (actionData, dataSourceConfig): Promise<any> {
    const runApiDsConfig = {
      url: "",
      serverURL: "",
      dynamicParamsConfig: dataSourceConfig,
    };
    return runOpenApi(actionData, runApiDsConfig, spec as OpenAPIV3.Document);
  },
};

export default stripePlugin;
