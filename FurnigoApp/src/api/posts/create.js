import { executeGraphQL, supabase } from "../../config/supabase";

export async function getUserIdFromUUID(userUUID) {
    console.log(`Fetching user ID from UUID: ${userUUID}`);

    const query = `
        query GetUserId($uuid: uuid!) {
            usersCollection(filter: { uuid: { eq: $uuid } }) {
                edges {
                    node {
                        id
                    }
                }
            }
        }
    `;

    const variables = { uuid: userUUID };

    try {
        console.log("Sending GraphQL Request for User ID Lookup...");
        const response = await executeGraphQL(query, variables);
        console.log("GraphQL Response for User ID:", JSON.stringify(response, null, 2));

        if (response?.usersCollection?.edges?.length > 0) {
            const userId = response.usersCollection.edges[0].node.id;
            console.log(`Found User ID: ${userId}`);
            return userId;
        } else {
            console.warn("No user found for this UUID.");
            return null;
        }
    } catch (error) {
        console.error("Error fetching user ID:", error);
        return null;
    }
}

export async function fetchLatestPostId(userId) {
    console.log(`Fetching latest post ID for user: ${userId}`);

    const query = `
          query GetLatestPost($user_id: Int!) {
            postsCollection(
                filter: { user_id: { eq: $user_id } }
                orderBy: [{ created_at: DescNullsLast }]
                first: 1
            ) {
                edges {
                    node {
                        id
                    }
                }
            }
        }
    `;

    const variables = { user_id: userId };

    try {
        const response = await executeGraphQL(query, variables);
        console.log("GraphQL Response for latest post:", response);

        if (response?.postsCollection?.edges?.length > 0) {
            const postId = response.postsCollection.edges[0].node.id;
            console.log(`Found Latest Post ID: ${postId}`);
            return postId;
        } else {
            console.warn("No post found for this user.");
            return null;
        }
    } catch (error) {
        console.error("Error fetching latest post ID:", error);
        return null;
    }
}


export async function createPost(postData) {
    console.log("Creating post in GraphQL (without pictures)...");

    const insertQuery = `
        mutation InsertPost(
            $user_id: Int!,
            $title: String!,
            $description: String!,
            $price: Int!,
            $location: String!,
            $pictures: [String!]!,
            $category: String!,
            $condition: String!,
            $status: String!,
            $ar_obj_id: Int
        ) {
            insertIntopostsCollection(objects: {
                user_id: $user_id,
                title: $title,
                description: $description,
                price: $price,
                location: $location,
                pictures: [],
                category: $category,
                condition: $condition,
                status: $status,  
                ar_obj_id: $ar_obj_id
            }) {
                affectedCount
            }
        }
    `;

    const userIdInt = parseInt(postData.user_id);
    if (isNaN(userIdInt)) {
        console.error("Error: Invalid user_id detected!");
        throw new Error("Invalid user_id: " + postData.user_id);
    }

    const priceValue = postData.price ? parseInt(postData.price) : 0;

    const variables = { 
        ...postData, 
        user_id: userIdInt,
        price: priceValue, 
        pictures: [],
        status: "available" 
    };

    try {
        console.log("Sending GraphQL Request for Post Creation...", variables);
        await executeGraphQL(insertQuery, variables);
        console.log("Post Created! Now fetching latest post ID...");

        const postId = await fetchLatestPostId(userIdInt);
        return postId;
        
    } catch (error) {
        console.error("Error creating post:", error);
        throw error;
    }
}


export async function updatePostImages(postId, imageUrls) {
    console.log("Updating post with uploaded image URLs:", imageUrls);

    const updateQuery = `
        mutation UpdatePost($post_id: Int!, $pictures: [String!]!) {
            updatepostsCollection(
                filter: { id: { eq: $post_id } }
                set: { pictures: $pictures }
            ) {
                affectedCount
            }
        }
    `;

    const variables = {
        post_id: postId,
        pictures: imageUrls,
    };

    try {
        console.log("Sending GraphQL Request for Post Update...");
        const response = await executeGraphQL(updateQuery, variables);
        console.log("GraphQL Response for Post Update:", JSON.stringify(response, null, 2));

        if (response?.updatepostsCollection?.affectedCount > 0) {
            console.log("Post updated successfully with image URLs!");
            return true;
        } else {
            console.error("Failed to update post with images.");
            return false;
        }
    } catch (error) {
        console.error("Error updating post:", error);
        return false;
    }
}


export async function uploadImages(imageUris, userId, postId) {
    console.log(`Uploading ${imageUris.length} images for Post ID: ${postId}`);

    let uploadedImageUrls = [];

    for (const uri of imageUris) {
        try {
            console.log(`Uploading image from path: ${uri}`);

            const fileName = `posts/${userId}/${postId}/${Date.now()}_image.jpg`;

            const file = {
                uri: uri,
                name: `post_image_${postId}.jpg`,
                type: "image/jpeg",
            };

            const { data, error } = await supabase.storage
                .from("post-images")  
                .upload(fileName, file, {
                    contentType: "image/jpeg",
                    cacheControl: "3600",
                    upsert: true,
                });

            if (error) {
                console.error(` Image upload failed:`, error.message);
                continue;  
            }

        
            const uploadedImageUrl = `https://feejgyyljwdewzeyuetb.supabase.co/storage/v1/object/public/post-images/${fileName}`;

            uploadedImageUrls.push(uploadedImageUrl);
            console.log(`Image Uploaded Successfully: ${uploadedImageUrl}`);

        } catch (error) {
            console.error("Error uploading image:", error);
        }
    }

    console.log("All uploaded image URLs:", uploadedImageUrls);
    return uploadedImageUrls;
}
