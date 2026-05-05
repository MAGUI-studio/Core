import { StyleSheet } from "@react-pdf/renderer"

// PDF Engine only supports Hex/RGB. Converting MAGUI brand colors.
export const BRAND_COLORS = {
  primary: "#D4B173", // Brand primary from oklch approx
  background: "#0F172A",
  text: "#F8FAFC",
  textMuted: "#94A3B8",
  border: "#334155",
}

export const styles = StyleSheet.create({
  page: {
    padding: 40,
    backgroundColor: "#FFFFFF",
    fontFamily: "Montserrat",
    fontSize: 10,
    color: "#1E293B",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 40,
    borderBottom: "1px solid #E2E8F0",
    paddingBottom: 20,
  },
  logoContainer: {
    width: 120,
  },
  studioInfo: {
    textAlign: "right",
    gap: 2,
  },
  studioName: {
    fontFamily: "Lexend",
    fontSize: 14,
    fontWeight: "bold",
    color: "#D4B173",
    textTransform: "uppercase",
  },
  studioDetails: {
    fontSize: 8,
    color: "#64748B",
  },
  titleSection: {
    marginBottom: 30,
  },
  proposalTitle: {
    fontFamily: "Lexend",
    fontSize: 24,
    fontWeight: "black",
    textTransform: "uppercase",
    marginBottom: 5,
  },
  proposalMeta: {
    flexDirection: "row",
    gap: 15,
    fontSize: 8,
    color: "#94A3B8",
    textTransform: "uppercase",
  },
  section: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontFamily: "Lexend",
    fontSize: 10,
    fontWeight: "bold",
    textTransform: "uppercase",
    color: "#D4B173",
    marginBottom: 10,
    letterSpacing: 2,
  },
  clientBox: {
    backgroundColor: "#F8FAFC",
    borderRadius: 8,
    padding: 15,
    border: "1px solid #F1F5F9",
  },
  clientRow: {
    flexDirection: "row",
    marginBottom: 5,
  },
  clientLabel: {
    width: 60,
    fontWeight: "bold",
    color: "#64748B",
  },
  table: {
    marginTop: 10,
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#F1F5F9",
    padding: 8,
    borderRadius: 4,
    fontWeight: "bold",
  },
  tableRow: {
    flexDirection: "row",
    borderBottom: "1px solid #F1F5F9",
    padding: 10,
  },
  colDesc: { flex: 4 },
  colQty: { flex: 1, textAlign: "center" },
  colVal: { flex: 1, textAlign: "right" },
  colTotal: { flex: 1, textAlign: "right", fontWeight: "bold" },
  totalSection: {
    marginTop: 20,
    padding: 15,
    backgroundColor: "#1E293B",
    borderRadius: 8,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  totalLabel: {
    color: "#FFFFFF",
    fontFamily: "Lexend",
    fontWeight: "bold",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  totalValue: {
    color: "#D4B173",
    fontSize: 18,
    fontWeight: "black",
  },
  footer: {
    position: "absolute",
    bottom: 40,
    left: 40,
    right: 40,
    borderTop: "1px solid #E2E8F0",
    paddingTop: 15,
    flexDirection: "row",
    justifyContent: "space-between",
    fontSize: 8,
    color: "#94A3B8",
  },
})
