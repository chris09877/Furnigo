import { executeGraphQL } from "../../config/supabase";

/**
 * Fetches all posts from the database using GraphQL.
 *
 * @returns {Promise<Object[]>} - Returns an array of posts or an empty array on failure.
 */
export async function getPosts() {
  const query = `
    query GetPosts {
      postsCollection {
        edges {
          node {
            id
            title
            description
            price
            location
            pictures
            status
            category
            condition
            created_at
          }
        }
      }
    }
  `;

  try {
    const result = await executeGraphQL(query);

    if (!result || !result.postsCollection) {
      console.error(
        "❌ GraphQL Response Error: Unexpected response format",
        result
      );
      return [];
    }

    // ✅ Safely return extracted posts
    return result.postsCollection.edges.map((edge) => edge.node);
  } catch (error) {
    console.error("🚨 Error fetching posts:", error);
    return [];
  }
}
