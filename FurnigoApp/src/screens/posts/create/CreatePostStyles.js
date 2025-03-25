import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: "center" },
  loader: { flex: 1, justifyContent: "center", alignItems: "center" },
  goBackButton: { alignSelf: "flex-start", padding: 10, marginBottom: 10 },
  goBackText: { fontSize: 18, color: "#007AFF", fontWeight: "bold" },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    marginBottom: 10,
    borderRadius: 5,
  },
  createButton: {
    marginTop: 20,
    backgroundColor: "#007AFF",
    paddingVertical: 12,
    borderRadius: 5,
    alignItems: "center",
  },
  label: {
    fontSize: 16,
    fontWeight: "bold",
    marginTop: 10,
    marginBottom: 2,
  },
  picker: {
    borderWidth: 1,
    padding: 5,
    borderColor: "#ccc",
    backgroundColor: "#f9f9f9",
    borderRadius: 5,
    marginBottom: 10,
  },
  disabledButton: { backgroundColor: "#ccc" },
  createButtonText: { fontSize: 18, color: "white", fontWeight: "bold" },
});

export default styles;
