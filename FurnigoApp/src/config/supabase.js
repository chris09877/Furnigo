
import { createClient } from '@supabase/supabase-js';
import { SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY, SUPABASE_GRAPHQL_URL } from '@env';

if (!SUPABASE_URL || !SUPABASE_ANON_KEY || !SUPABASE_GRAPHQL_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error("Missing Supabase environment variables! Check your .env file.");

};



const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const executeGraphQL = async (query, variables = {}) => {
  try {
    console.log("Sending GraphQL Request:", {
      query,
      variables,
      url: SUPABASE_GRAPHQL_URL,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        apikey: SUPABASE_SERVICE_ROLE_KEY,
      },
    });

    const response = await fetch(SUPABASE_GRAPHQL_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        apikey: SUPABASE_SERVICE_ROLE_KEY,
      },
      body: JSON.stringify({ query, variables }),
    });

    const result = await response.json();
    console.log("GraphQL Response:", result);

    if (!result || !result.data) {
      console.error(
        "GraphQL Error: Response is undefined or missing data",
        result
      );
      return { error: result.message || "GraphQL request failed" };
    }

    return result.data;
  } catch (error) {
    console.error("GraphQL Request Failed:", error);
    return { error: "GraphQL network error" };
  }
};

export { supabase, executeGraphQL };
