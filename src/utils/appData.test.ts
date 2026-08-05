import { describe, expect, it } from "vitest";
import { buildDashboard, buildStudentDetail, filterStudents, sampleEvents, sampleStudents } from "@/utils/appData";

describe("appData helpers", () => {
  it("tinh duoc dashboard stats co tong sinh vien", () => {
    const dashboard = buildDashboard(sampleStudents, sampleEvents);
    expect(dashboard.stats[0].value).toBe(sampleStudents.length);
    expect(dashboard.recentStudents.length).toBeGreaterThan(0);
  });

  it("loc sinh vien theo tu khoa va nghiep vu", () => {
    const results = filterStudents(sampleStudents, sampleEvents, {
      keyword: "minh anh",
      eventType: "hoc_bong",
    });
    expect(results).toHaveLength(1);
    expect(results[0].studentCode).toBe("SV23001");
  });

  it("tra ve chi tiet sinh vien kem su kien", () => {
    const student = buildStudentDetail("s1", sampleStudents, sampleEvents);
    expect(student?.fullName).toBe("Nguyễn Minh Anh");
    expect(student?.events.length).toBeGreaterThan(1);
  });
});
