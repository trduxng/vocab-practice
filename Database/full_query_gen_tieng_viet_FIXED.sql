/*
    ============================================================
    UNIFIED DATABASE SCRIPT: TOEIC Vocabulary DangHoc Platform
    Bao gồm: 
      1. Schema tieng Viet da chuyen doi
      2. Seed Data (Dữ liệu mẫu)
      3. Migration Dynamic Quyen (Hệ thống phân quyền)
    ============================================================
*/

-- ============================================================
-- PHẦN 1: PROTOTYPE DATABASE SCHEMA
-- ============================================================

SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
GO

/* 1. CREATE DATABASE */
IF DB_ID(N'NenTangTuVungTOEIC') IS NULL
BEGIN
    CREATE DATABASE NenTangTuVungTOEIC;
END
GO

USE NenTangTuVungTOEIC;
GO

/* 2. DROP OBJECTS IF EXISTS (safe re-run script) */

/* Extra drops for merged migration extension objects */
IF OBJECT_ID(N'dbo.vw_TongQuanDanhMucChuDe', N'V') IS NOT NULL DROP VIEW dbo.vw_TongQuanDanhMucChuDe;
IF OBJECT_ID(N'dbo.vw_PhanTichBaiKiemTraNho', N'V') IS NOT NULL DROP VIEW dbo.vw_PhanTichBaiKiemTraNho;
IF OBJECT_ID(N'dbo.vw_PhanTichHocTapChuDe', N'V') IS NOT NULL DROP VIEW dbo.vw_PhanTichHocTapChuDe;
IF OBJECT_ID(N'dbo.vw_TongQuanNoiDungBienTapVien', N'V') IS NOT NULL DROP VIEW dbo.vw_TongQuanNoiDungBienTapVien;
GO

IF OBJECT_ID(N'dbo.LienKetMediaNoiDung', N'U') IS NOT NULL DROP TABLE dbo.LienKetMediaNoiDung;
IF OBJECT_ID(N'dbo.TepMedia', N'U') IS NOT NULL DROP TABLE dbo.TepMedia;
IF OBJECT_ID(N'dbo.NhatKyDuyetNoiDung', N'U') IS NOT NULL DROP TABLE dbo.NhatKyDuyetNoiDung;
IF OBJECT_ID(N'dbo.LanLamBaiKiemTraNho', N'U') IS NOT NULL DROP TABLE dbo.LanLamBaiKiemTraNho;
IF OBJECT_ID(N'dbo.SoTayTuVungNguoiDung', N'U') IS NOT NULL DROP TABLE dbo.SoTayTuVungNguoiDung;
IF OBJECT_ID(N'dbo.DangKyChuDeNguoiDung', N'U') IS NOT NULL DROP TABLE dbo.DangKyChuDeNguoiDung;

IF EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name = N'FK_ChuDe_DanhMucChuDeID')
    ALTER TABLE dbo.ChuDe DROP CONSTRAINT FK_ChuDe_DanhMucChuDeID;

IF OBJECT_ID(N'dbo.DanhMucChuDe', N'U') IS NOT NULL DROP TABLE dbo.DanhMucChuDe;
GO

IF OBJECT_ID(N'dbo.usp_GhiNhanLanTraLoiCauHoi', N'P') IS NOT NULL
    DROP PROCEDURE dbo.usp_GhiNhanLanTraLoiCauHoi;
GO

IF OBJECT_ID(N'dbo.LanLamBaiTap', N'U') IS NOT NULL DROP TABLE dbo.LanLamBaiTap;
IF OBJECT_ID(N'dbo.CauHoiBaiKiemTraNho', N'U') IS NOT NULL DROP TABLE dbo.CauHoiBaiKiemTraNho;
IF OBJECT_ID(N'dbo.BaiKiemTraNho', N'U') IS NOT NULL DROP TABLE dbo.BaiKiemTraNho;
IF OBJECT_ID(N'dbo.TienDoTuVungNguoiDung', N'U') IS NOT NULL DROP TABLE dbo.TienDoTuVungNguoiDung;
IF OBJECT_ID(N'dbo.CauHoi', N'U') IS NOT NULL DROP TABLE dbo.CauHoi;
IF OBJECT_ID(N'dbo.TuVungChuDe', N'U') IS NOT NULL DROP TABLE dbo.TuVungChuDe;
IF OBJECT_ID(N'dbo.CauViDu', N'U') IS NOT NULL DROP TABLE dbo.CauViDu;
IF OBJECT_ID(N'dbo.TuVung', N'U') IS NOT NULL DROP TABLE dbo.TuVung;
IF OBJECT_ID(N'dbo.ChuDe', N'U') IS NOT NULL DROP TABLE dbo.ChuDe;
IF OBJECT_ID(N'dbo.TuLoai', N'U') IS NOT NULL DROP TABLE dbo.TuLoai;
IF OBJECT_ID(N'dbo.NguoiDung', N'U') IS NOT NULL DROP TABLE dbo.NguoiDung;
GO

/* 3. MASTER TABLES */
CREATE TABLE dbo.NguoiDung
(
    NguoiDungID               BIGINT IDENTITY(1,1) NOT NULL,
    HoTen             NVARCHAR(200) NOT NULL,
    Email                NVARCHAR(255) NOT NULL,
    MatKhauHash         NVARCHAR(500) NOT NULL,
    VaiTroNguoiDung             NVARCHAR(30) NOT NULL,
    DangHoatDong             BIT NOT NULL CONSTRAINT DF_NguoiDung_DangHoatDong DEFAULT (1),
    ThoiDiemTao            DATETIMEOFFSET(7) NOT NULL CONSTRAINT DF_NguoiDung_ThoiDiemTao DEFAULT (SYSDATETIMEOFFSET()),
    ThoiDiemCapNhat            DATETIMEOFFSET(7) NOT NULL CONSTRAINT DF_NguoiDung_ThoiDiemCapNhat DEFAULT (SYSDATETIMEOFFSET()),

    CONSTRAINT PK_NguoiDung PRIMARY KEY CLUSTERED (NguoiDungID),
    CONSTRAINT UQ_NguoiDung_Email UNIQUE (Email),
    CONSTRAINT CK_NguoiDung_VaiTroNguoiDung CHECK (VaiTroNguoiDung IN (N'NguoiHoc', N'BienTapVien', N'QuanTriVien'))
);
GO

CREATE TABLE dbo.TuLoai
(
    TuLoaiID       INT IDENTITY(1,1) NOT NULL,
    MaTuLoai     NVARCHAR(20) NOT NULL,
    TenTuLoai     NVARCHAR(100) NOT NULL,
    MoTa          NVARCHAR(255) NULL,

    CONSTRAINT PK_TuLoai PRIMARY KEY CLUSTERED (TuLoaiID),
    CONSTRAINT UQ_TuLoai_Code UNIQUE (MaTuLoai),
    CONSTRAINT UQ_TuLoai_Name UNIQUE (TenTuLoai)
);
GO

CREATE TABLE dbo.ChuDe
(
    ChuDeID              BIGINT IDENTITY(1,1) NOT NULL,
    TenChuDe            NVARCHAR(200) NOT NULL,
    MaChuDe            NVARCHAR(50) NOT NULL,
    MoTa          NVARCHAR(1000) NULL,
    NguoiTaoID      BIGINT NOT NULL,
    ThoiDiemTao            DATETIMEOFFSET(7) NOT NULL CONSTRAINT DF_ChuDe_ThoiDiemTao DEFAULT (SYSDATETIMEOFFSET()),
    ThoiDiemCapNhat            DATETIMEOFFSET(7) NOT NULL CONSTRAINT DF_ChuDe_ThoiDiemCapNhat DEFAULT (SYSDATETIMEOFFSET()),

    CONSTRAINT PK_ChuDe PRIMARY KEY CLUSTERED (ChuDeID),
    CONSTRAINT UQ_ChuDe_TenChuDe UNIQUE (TenChuDe),
    CONSTRAINT UQ_ChuDe_MaChuDe UNIQUE (MaChuDe),
    CONSTRAINT FK_ChuDe_NguoiTaoID FOREIGN KEY (NguoiTaoID)
        REFERENCES dbo.NguoiDung(NguoiDungID)
        ON DELETE NO ACTION
        ON UPDATE NO ACTION
);
GO

/* 4. VOCABULARY CONTENT TABLES */
CREATE TABLE dbo.TuVung
(
    TuVungID               BIGINT IDENTITY(1,1) NOT NULL,
    Tu                 NVARCHAR(200) NOT NULL,
    TuLoaiID       INT NOT NULL,
    Nghia              NVARCHAR(1000) NOT NULL,
    PhienAm             NVARCHAR(255) NULL,
    AudioURLUK           NVARCHAR(1000) NULL,
    AudioURLUS           NVARCHAR(1000) NULL,
    HinhAnhURL             NVARCHAR(1000) NULL,
    MucDoKho      TINYINT NOT NULL CONSTRAINT DF_TuVung_MucDoKho DEFAULT (1),
    NguoiTaoID      BIGINT NOT NULL,
    ThoiDiemTao            DATETIMEOFFSET(7) NOT NULL CONSTRAINT DF_TuVung_ThoiDiemTao DEFAULT (SYSDATETIMEOFFSET()),
    ThoiDiemCapNhat            DATETIMEOFFSET(7) NOT NULL CONSTRAINT DF_TuVung_ThoiDiemCapNhat DEFAULT (SYSDATETIMEOFFSET()),

    CONSTRAINT PK_TuVung PRIMARY KEY CLUSTERED (TuVungID),
    CONSTRAINT FK_TuVung_TuLoaiID FOREIGN KEY (TuLoaiID)
        REFERENCES dbo.TuLoai(TuLoaiID)
        ON DELETE NO ACTION
        ON UPDATE NO ACTION,
    CONSTRAINT FK_TuVung_NguoiTaoID FOREIGN KEY (NguoiTaoID)
        REFERENCES dbo.NguoiDung(NguoiDungID)
        ON DELETE NO ACTION
        ON UPDATE NO ACTION,
    CONSTRAINT UQ_TuVung_Tu_PartOfSpeech UNIQUE (Tu, TuLoaiID),
    CONSTRAINT CK_TuVung_MucDoKho CHECK (MucDoKho BETWEEN 1 AND 5)
);
GO

CREATE TABLE dbo.CauViDu
(
    CauViDuID    BIGINT IDENTITY(1,1) NOT NULL,
    TuVungID               BIGINT NOT NULL,
    CauTiengAnh         NVARCHAR(2000) NOT NULL,
    DichNghia  NVARCHAR(2000) NULL,
    AudioURL             NVARCHAR(1000) NULL,
    ThoiDiemTao            DATETIMEOFFSET(7) NOT NULL CONSTRAINT DF_CauViDu_ThoiDiemTao DEFAULT (SYSDATETIMEOFFSET()),
    ThoiDiemCapNhat            DATETIMEOFFSET(7) NOT NULL CONSTRAINT DF_CauViDu_ThoiDiemCapNhat DEFAULT (SYSDATETIMEOFFSET()),

    CONSTRAINT PK_CauViDu PRIMARY KEY CLUSTERED (CauViDuID),
    CONSTRAINT FK_CauViDu_TuVungID FOREIGN KEY (TuVungID)
        REFERENCES dbo.TuVung(TuVungID)
        ON DELETE CASCADE
        ON UPDATE NO ACTION
);
GO

CREATE TABLE dbo.TuVungChuDe
(
    TuVungID               BIGINT NOT NULL,
    ChuDeID              BIGINT NOT NULL,
    ThoiDiemGan           DATETIMEOFFSET(7) NOT NULL CONSTRAINT DF_TuVungChuDe_ThoiDiemGan DEFAULT (SYSDATETIMEOFFSET()),

    CONSTRAINT PK_TuVungChuDe PRIMARY KEY CLUSTERED (TuVungID, ChuDeID),
    CONSTRAINT FK_TuVungChuDe_TuVungID FOREIGN KEY (TuVungID)
        REFERENCES dbo.TuVung(TuVungID)
        ON DELETE CASCADE
        ON UPDATE NO ACTION,
    CONSTRAINT FK_TuVungChuDe_ChuDeID FOREIGN KEY (ChuDeID)
        REFERENCES dbo.ChuDe(ChuDeID)
        ON DELETE CASCADE
        ON UPDATE NO ACTION
);
GO

/* 5. QUESTION / EXERCISE TABLES */
CREATE TABLE dbo.CauHoi
(
    CauHoiID           BIGINT IDENTITY(1,1) NOT NULL,
    TuVungID               BIGINT NOT NULL,
    LoaiCauHoi         NVARCHAR(30) NOT NULL,
    NoiDungCauHoi         NVARCHAR(2000) NOT NULL,
    LuaChonJSON          NVARCHAR(MAX) NOT NULL,
    DapAnDung        NVARCHAR(500) NOT NULL,
    GiaiThich          NVARCHAR(2000) NULL,
    MucDoKho      TINYINT NOT NULL CONSTRAINT DF_CauHoi_MucDoKho DEFAULT (1),
    NguoiTaoID      BIGINT NOT NULL,
    ThoiDiemTao            DATETIMEOFFSET(7) NOT NULL CONSTRAINT DF_CauHoi_ThoiDiemTao DEFAULT (SYSDATETIMEOFFSET()),
    ThoiDiemCapNhat            DATETIMEOFFSET(7) NOT NULL CONSTRAINT DF_CauHoi_ThoiDiemCapNhat DEFAULT (SYSDATETIMEOFFSET()),

    CONSTRAINT PK_CauHoi PRIMARY KEY CLUSTERED (CauHoiID),
    CONSTRAINT FK_CauHoi_TuVungID FOREIGN KEY (TuVungID)
        REFERENCES dbo.TuVung(TuVungID)
        ON DELETE CASCADE
        ON UPDATE NO ACTION,
    CONSTRAINT FK_CauHoi_NguoiTaoID FOREIGN KEY (NguoiTaoID)
        REFERENCES dbo.NguoiDung(NguoiDungID)
        ON DELETE NO ACTION
        ON UPDATE NO ACTION,
    CONSTRAINT CK_CauHoi_LoaiCauHoi CHECK
    (
        LoaiCauHoi IN
        (
            N'MCQ',
            N'DienKhuyet',
            N'DragDrop',
            N'Dictation',
            N'FlashcardCheck'
        )
    ),
    CONSTRAINT CK_CauHoi_MucDoKho CHECK (MucDoKho BETWEEN 1 AND 5),
    CONSTRAINT CK_CauHoi_LuaChonJSON_IsJson CHECK (ISJSON(LuaChonJSON) = 1)
);
GO

/* 6. LEARNING PROGRESS TABLES */
CREATE TABLE dbo.TienDoTuVungNguoiDung
(
    TienDoTuVungNguoiDungID   BIGINT IDENTITY(1,1) NOT NULL,
    NguoiDungID               BIGINT NOT NULL,
    TuVungID               BIGINT NOT NULL,
    MucDoThanhThao         TINYINT NOT NULL CONSTRAINT DF_TienDoTuVungNguoiDung_MucDoThanhThao DEFAULT (0),
    HeSoDeNho           DECIMAL(4,2) NOT NULL CONSTRAINT DF_TienDoTuVungNguoiDung_HeSoDeNho DEFAULT (2.50),
    SoLanLapLai      INT NOT NULL CONSTRAINT DF_TienDoTuVungNguoiDung_SoLanLapLai DEFAULT (0),
    SoLanDungLienTiep   INT NOT NULL CONSTRAINT DF_TienDoTuVungNguoiDung_SoLanDungLienTiep DEFAULT (0),
    SoLanSaiLienTiep     INT NOT NULL CONSTRAINT DF_TienDoTuVungNguoiDung_SoLanSaiLienTiep DEFAULT (0),
    ThoiDiemOnTapGanNhat       DATETIMEOFFSET(7) NULL,
    NgayOnTapTiepTheo       DATETIMEOFFSET(7) NULL,
    DiemGanNhat            DECIMAL(5,2) NULL,
    TrangThaiGhiNho         NVARCHAR(30) NOT NULL CONSTRAINT DF_TienDoTuVungNguoiDung_TrangThaiGhiNho DEFAULT (N'Moi'),
    ThoiDiemTao            DATETIMEOFFSET(7) NOT NULL CONSTRAINT DF_TienDoTuVungNguoiDung_ThoiDiemTao DEFAULT (SYSDATETIMEOFFSET()),
    ThoiDiemCapNhat            DATETIMEOFFSET(7) NOT NULL CONSTRAINT DF_TienDoTuVungNguoiDung_ThoiDiemCapNhat DEFAULT (SYSDATETIMEOFFSET()),

    CONSTRAINT PK_TienDoTuVungNguoiDung PRIMARY KEY CLUSTERED (TienDoTuVungNguoiDungID),
    CONSTRAINT FK_TienDoTuVungNguoiDung_NguoiDungID FOREIGN KEY (NguoiDungID)
        REFERENCES dbo.NguoiDung(NguoiDungID)
        ON DELETE CASCADE
        ON UPDATE NO ACTION,
    CONSTRAINT FK_TienDoTuVungNguoiDung_TuVungID FOREIGN KEY (TuVungID)
        REFERENCES dbo.TuVung(TuVungID)
        ON DELETE CASCADE
        ON UPDATE NO ACTION,
    CONSTRAINT UQ_TienDoTuVungNguoiDung_NguoiDungID_TuVungID UNIQUE (NguoiDungID, TuVungID),
    CONSTRAINT CK_TienDoTuVungNguoiDung_MucDoThanhThao CHECK (MucDoThanhThao BETWEEN 0 AND 10),
    CONSTRAINT CK_TienDoTuVungNguoiDung_HeSoDeNho CHECK (HeSoDeNho BETWEEN 1.30 AND 3.50),
    CONSTRAINT CK_TienDoTuVungNguoiDung_SoLanLapLai CHECK (SoLanLapLai >= 0),
    CONSTRAINT CK_TienDoTuVungNguoiDung_SoLanDungLienTiep CHECK (SoLanDungLienTiep >= 0),
    CONSTRAINT CK_TienDoTuVungNguoiDung_SoLanSaiLienTiep CHECK (SoLanSaiLienTiep >= 0),
    CONSTRAINT CK_TienDoTuVungNguoiDung_DiemGanNhat CHECK (DiemGanNhat IS NULL OR (DiemGanNhat BETWEEN 0 AND 100)),
    CONSTRAINT CK_TienDoTuVungNguoiDung_TrangThaiGhiNho CHECK
    (
        TrangThaiGhiNho IN (N'Moi', N'DangHoc', N'DangOnTap', N'DaThanhThao', N'BiQuen')
    )
);
GO

CREATE TABLE dbo.LanLamBaiTap
(
    LanLamBaiTapID    BIGINT IDENTITY(1,1) NOT NULL,
    NguoiDungID               BIGINT NOT NULL,
    CauHoiID           BIGINT NOT NULL,
    TuVungID               BIGINT NOT NULL,
    DapAnDaNop      NVARCHAR(1000) NOT NULL,
    DungSai            BIT NOT NULL,
    DiemNhanDuoc         DECIMAL(5,2) NOT NULL,
    ThoiDiemLam          DATETIMEOFFSET(7) NOT NULL CONSTRAINT DF_LanLamBaiTap_ThoiDiemLam DEFAULT (SYSDATETIMEOFFSET()),
    DoLechMuiGioClient NVARCHAR(10) NULL,
    MetadataLanLamJSON  NVARCHAR(MAX) NULL,

    CONSTRAINT PK_LanLamBaiTap PRIMARY KEY CLUSTERED (LanLamBaiTapID),
    CONSTRAINT FK_LanLamBaiTap_NguoiDungID FOREIGN KEY (NguoiDungID)
        REFERENCES dbo.NguoiDung(NguoiDungID)
        ON DELETE CASCADE
        ON UPDATE NO ACTION,
    CONSTRAINT FK_LanLamBaiTap_CauHoiID FOREIGN KEY (CauHoiID)
        REFERENCES dbo.CauHoi(CauHoiID)
        ON DELETE NO ACTION
        ON UPDATE NO ACTION,
    CONSTRAINT FK_LanLamBaiTap_TuVungID FOREIGN KEY (TuVungID)
        REFERENCES dbo.TuVung(TuVungID)
        ON DELETE NO ACTION
        ON UPDATE NO ACTION,
    CONSTRAINT CK_LanLamBaiTap_DiemNhanDuoc CHECK (DiemNhanDuoc BETWEEN 0 AND 100),
    CONSTRAINT CK_LanLamBaiTap_MetadataLanLamJSON_IsJson CHECK
    (
        MetadataLanLamJSON IS NULL OR ISJSON(MetadataLanLamJSON) = 1
    )
);
GO

/* 7. MINI TEST TABLES */
CREATE TABLE dbo.BaiKiemTraNho
(
    BaiKiemTraNhoID           BIGINT IDENTITY(1,1) NOT NULL,
    ChuDeID              BIGINT NULL,
    TieuDeBaiKiemTra            NVARCHAR(255) NOT NULL,
    MoTa          NVARCHAR(1000) NULL,
    NguoiTaoID      BIGINT NOT NULL,
    TongSoCauHoi       INT NOT NULL CONSTRAINT DF_BaiKiemTraNho_TongSoCauHoi DEFAULT (0),
    DaXuatBan          BIT NOT NULL CONSTRAINT DF_BaiKiemTraNho_DaXuatBan DEFAULT (0),
    ThoiDiemTao            DATETIMEOFFSET(7) NOT NULL CONSTRAINT DF_BaiKiemTraNho_ThoiDiemTao DEFAULT (SYSDATETIMEOFFSET()),
    ThoiDiemCapNhat            DATETIMEOFFSET(7) NOT NULL CONSTRAINT DF_BaiKiemTraNho_ThoiDiemCapNhat DEFAULT (SYSDATETIMEOFFSET()),

    CONSTRAINT PK_BaiKiemTraNho PRIMARY KEY CLUSTERED (BaiKiemTraNhoID),
    CONSTRAINT FK_BaiKiemTraNho_ChuDeID FOREIGN KEY (ChuDeID)
        REFERENCES dbo.ChuDe(ChuDeID)
        ON DELETE SET NULL
        ON UPDATE NO ACTION,
    CONSTRAINT FK_BaiKiemTraNho_NguoiTaoID FOREIGN KEY (NguoiTaoID)
        REFERENCES dbo.NguoiDung(NguoiDungID)
        ON DELETE NO ACTION
        ON UPDATE NO ACTION,
    CONSTRAINT CK_BaiKiemTraNho_TongSoCauHoi CHECK (TongSoCauHoi >= 0)
);
GO

CREATE TABLE dbo.CauHoiBaiKiemTraNho
(
    BaiKiemTraNhoID           BIGINT NOT NULL,
    CauHoiID           BIGINT NOT NULL,
    ThuTuHienThi         INT NOT NULL,

    CONSTRAINT PK_CauHoiBaiKiemTraNho PRIMARY KEY CLUSTERED (BaiKiemTraNhoID, CauHoiID),
    CONSTRAINT FK_CauHoiBaiKiemTraNho_BaiKiemTraNhoID FOREIGN KEY (BaiKiemTraNhoID)
        REFERENCES dbo.BaiKiemTraNho(BaiKiemTraNhoID)
        ON DELETE CASCADE
        ON UPDATE NO ACTION,
    CONSTRAINT FK_CauHoiBaiKiemTraNho_CauHoiID FOREIGN KEY (CauHoiID)
        REFERENCES dbo.CauHoi(CauHoiID)
        ON DELETE NO ACTION
        ON UPDATE NO ACTION,
    CONSTRAINT UQ_CauHoiBaiKiemTraNho_BaiKiemTraNhoID_ThuTuHienThi UNIQUE (BaiKiemTraNhoID, ThuTuHienThi),
    CONSTRAINT CK_CauHoiBaiKiemTraNho_ThuTuHienThi CHECK (ThuTuHienThi > 0)
);
GO

/* 8. INDEXES FOR PERFORMANCE */
CREATE NONCLUSTERED INDEX IX_TienDoTuVungNguoiDung_NguoiDungID ON dbo.TienDoTuVungNguoiDung (NguoiDungID);
CREATE NONCLUSTERED INDEX IX_TienDoTuVungNguoiDung_TuVungID ON dbo.TienDoTuVungNguoiDung (TuVungID);
CREATE NONCLUSTERED INDEX IX_TienDoTuVungNguoiDung_NguoiDungID_NgayOnTapTiepTheo ON dbo.TienDoTuVungNguoiDung (NguoiDungID, NgayOnTapTiepTheo) INCLUDE (TuVungID, MucDoThanhThao, TrangThaiGhiNho, SoLanLapLai, HeSoDeNho);
CREATE NONCLUSTERED INDEX IX_TienDoTuVungNguoiDung_NgayOnTapTiepTheo ON dbo.TienDoTuVungNguoiDung (NgayOnTapTiepTheo) INCLUDE (NguoiDungID, TuVungID, TrangThaiGhiNho);
CREATE NONCLUSTERED INDEX IX_CauHoi_TuVungID ON dbo.CauHoi (TuVungID);
CREATE NONCLUSTERED INDEX IX_CauHoi_NguoiTaoID ON dbo.CauHoi (NguoiTaoID);
CREATE NONCLUSTERED INDEX IX_TuVungChuDe_ChuDeID ON dbo.TuVungChuDe (ChuDeID);
CREATE NONCLUSTERED INDEX IX_LanLamBaiTap_NguoiDungID_ThoiDiemLam ON dbo.LanLamBaiTap (NguoiDungID, ThoiDiemLam DESC) INCLUDE (CauHoiID, TuVungID, DungSai, DiemNhanDuoc);
CREATE NONCLUSTERED INDEX IX_LanLamBaiTap_TuVungID ON dbo.LanLamBaiTap (TuVungID);
CREATE NONCLUSTERED INDEX IX_LanLamBaiTap_CauHoiID ON dbo.LanLamBaiTap (CauHoiID);
CREATE NONCLUSTERED INDEX IX_CauViDu_TuVungID ON dbo.CauViDu (TuVungID);
CREATE NONCLUSTERED INDEX IX_TuVung_TuLoaiID ON dbo.TuVung (TuLoaiID);
CREATE NONCLUSTERED INDEX IX_TuVung_NguoiTaoID ON dbo.TuVung (NguoiTaoID);
CREATE NONCLUSTERED INDEX IX_BaiKiemTraNho_ChuDeID ON dbo.BaiKiemTraNho (ChuDeID);
CREATE NONCLUSTERED INDEX IX_CauHoiBaiKiemTraNho_CauHoiID ON dbo.CauHoiBaiKiemTraNho (CauHoiID);
GO

/* 9. STORED PROCEDURE */
CREATE PROCEDURE dbo.usp_GhiNhanLanTraLoiCauHoi
(
    @NguoiDungID               BIGINT,
    @CauHoiID           BIGINT,
    @DapAnDaNop      NVARCHAR(1000),
    @DoLechMuiGioClient NVARCHAR(10) = NULL,
    @MetadataLanLamJSON  NVARCHAR(MAX) = NULL
)
AS
BEGIN
    SET NOCOUNT ON;
    SET XACT_ABORT ON;

    DECLARE
        @TuVungID               BIGINT,
        @DapAnDung        NVARCHAR(500),
        @LoaiCauHoi         NVARCHAR(30),
        @DungSai            BIT,
        @DiemNhanDuoc         DECIMAL(5,2),
        @Now                  DATETIMEOFFSET(7),
        @TienDoTuVungNguoiDungID   BIGINT,
        @MucDoThanhThao         TINYINT,
        @HeSoDeNho           DECIMAL(4,2),
        @SoLanLapLai      INT,
        @SoLanDungLienTiep   INT,
        @SoLanSaiLienTiep     INT,
        @DiemGanNhat            DECIMAL(5,2),
        @TrangThaiGhiNho         NVARCHAR(30),
        @NgayOnTapTiepTheo       DATETIMEOFFSET(7),
        @IntervalDays         INT;

    BEGIN TRY
        BEGIN TRAN;

        IF @MetadataLanLamJSON IS NOT NULL AND ISJSON(@MetadataLanLamJSON) <> 1
        BEGIN
            THROW 50001, N'MetadataLanLamJSON phải là JSON hợp lệ.', 1;
        END

        SET @Now = SYSDATETIMEOFFSET();

        SELECT
            @TuVungID = q.TuVungID,
            @DapAnDung = q.DapAnDung,
            @LoaiCauHoi = q.LoaiCauHoi
        FROM dbo.CauHoi AS q
        WHERE q.CauHoiID = @CauHoiID;

        IF @TuVungID IS NULL
        BEGIN
            THROW 50002, N'CauHoiID không tồn tại.', 1;
        END

        IF NOT EXISTS (SELECT 1 FROM dbo.NguoiDung AS u WHERE u.NguoiDungID = @NguoiDungID AND u.DangHoatDong = 1)
        BEGIN
            THROW 50003, N'NguoiDungID không hợp lệ hoặc đã bị vô hiệu hóa.', 1;
        END

        SET @DungSai = CASE WHEN LOWER(LTRIM(RTRIM(@DapAnDaNop))) = LOWER(LTRIM(RTRIM(@DapAnDung))) THEN 1 ELSE 0 END;
        SET @DiemNhanDuoc = CASE WHEN @DungSai = 1 THEN 100.00 ELSE 0.00 END;

        SELECT
            @TienDoTuVungNguoiDungID = uwp.TienDoTuVungNguoiDungID,
            @MucDoThanhThao = uwp.MucDoThanhThao,
            @HeSoDeNho = uwp.HeSoDeNho,
            @SoLanLapLai = uwp.SoLanLapLai,
            @SoLanDungLienTiep = uwp.SoLanDungLienTiep,
            @SoLanSaiLienTiep = uwp.SoLanSaiLienTiep,
            @DiemGanNhat = uwp.DiemGanNhat,
            @TrangThaiGhiNho = uwp.TrangThaiGhiNho
        FROM dbo.TienDoTuVungNguoiDung AS uwp WITH (UPDLOCK, HOLDLOCK)
        WHERE uwp.NguoiDungID = @NguoiDungID AND uwp.TuVungID = @TuVungID;

        IF @TienDoTuVungNguoiDungID IS NULL
        BEGIN
            INSERT INTO dbo.TienDoTuVungNguoiDung (NguoiDungID, TuVungID, MucDoThanhThao, HeSoDeNho, SoLanLapLai, SoLanDungLienTiep, SoLanSaiLienTiep, ThoiDiemOnTapGanNhat, NgayOnTapTiepTheo, DiemGanNhat, TrangThaiGhiNho, ThoiDiemTao, ThoiDiemCapNhat)
            VALUES (@NguoiDungID, @TuVungID, 0, 2.50, 0, 0, 0, NULL, NULL, NULL, N'Moi', @Now, @Now);

            SET @TienDoTuVungNguoiDungID = SCOPE_IDENTITY();
            SET @MucDoThanhThao = 0;
            SET @HeSoDeNho = 2.50;
            SET @SoLanLapLai = 0;
            SET @SoLanDungLienTiep = 0;
            SET @SoLanSaiLienTiep = 0;
            SET @TrangThaiGhiNho = N'Moi';
        END

        INSERT INTO dbo.LanLamBaiTap (NguoiDungID, CauHoiID, TuVungID, DapAnDaNop, DungSai, DiemNhanDuoc, ThoiDiemLam, DoLechMuiGioClient, MetadataLanLamJSON)
        VALUES (@NguoiDungID, @CauHoiID, @TuVungID, @DapAnDaNop, @DungSai, @DiemNhanDuoc, @Now, @DoLechMuiGioClient, @MetadataLanLamJSON);

        IF @DungSai = 1
        BEGIN
            SET @SoLanLapLai = @SoLanLapLai + 1;
            SET @SoLanDungLienTiep = @SoLanDungLienTiep + 1;
            SET @SoLanSaiLienTiep = 0;
            SET @MucDoThanhThao = CASE WHEN @MucDoThanhThao < 10 THEN @MucDoThanhThao + 1 ELSE 10 END;
            SET @HeSoDeNho = CASE WHEN @HeSoDeNho + 0.10 > 3.50 THEN 3.50 ELSE @HeSoDeNho + 0.10 END;
        END
        ELSE
        BEGIN
            SET @SoLanLapLai = 0;
            SET @SoLanDungLienTiep = 0;
            SET @SoLanSaiLienTiep = @SoLanSaiLienTiep + 1;
            SET @MucDoThanhThao = CASE WHEN @MucDoThanhThao > 0 THEN @MucDoThanhThao - 1 ELSE 0 END;
            SET @HeSoDeNho = CASE WHEN @HeSoDeNho - 0.20 < 1.30 THEN 1.30 ELSE @HeSoDeNho - 0.20 END;
        END

        IF @DungSai = 0
        BEGIN
            SET @IntervalDays = 0; 
            SET @NgayOnTapTiepTheo = DATEADD(MINUTE, 30, @Now);
            SET @TrangThaiGhiNho = N'BiQuen';
        END
        ELSE
        BEGIN
            SET @IntervalDays = CASE WHEN @SoLanLapLai = 1 THEN 1 WHEN @SoLanLapLai = 2 THEN 3 WHEN @SoLanLapLai = 3 THEN 7 WHEN @SoLanLapLai = 4 THEN 14 WHEN @SoLanLapLai = 5 THEN 30 ELSE CAST(ROUND((@SoLanLapLai * @HeSoDeNho * 10.0), 0) AS INT) END;
            SET @NgayOnTapTiepTheo = DATEADD(DAY, @IntervalDays, @Now);
            SET @TrangThaiGhiNho = CASE WHEN @MucDoThanhThao >= 8 THEN N'DaThanhThao' WHEN @MucDoThanhThao >= 5 THEN N'DangOnTap' ELSE N'DangHoc' END;
        END

        UPDATE dbo.TienDoTuVungNguoiDung
        SET MucDoThanhThao = @MucDoThanhThao, HeSoDeNho = @HeSoDeNho, SoLanLapLai = @SoLanLapLai, SoLanDungLienTiep = @SoLanDungLienTiep, SoLanSaiLienTiep = @SoLanSaiLienTiep, ThoiDiemOnTapGanNhat = @Now, NgayOnTapTiepTheo = @NgayOnTapTiepTheo, DiemGanNhat = @DiemNhanDuoc, TrangThaiGhiNho = @TrangThaiGhiNho, ThoiDiemCapNhat = @Now
        WHERE TienDoTuVungNguoiDungID = @TienDoTuVungNguoiDungID;

        COMMIT TRAN;

        SELECT @NguoiDungID AS NguoiDungID, @CauHoiID AS CauHoiID, @TuVungID AS TuVungID, @DungSai AS DungSai, @DiemNhanDuoc AS DiemNhanDuoc, @MucDoThanhThao AS MucDoThanhThao, @HeSoDeNho AS HeSoDeNho, @SoLanLapLai AS SoLanLapLai, @TrangThaiGhiNho AS TrangThaiGhiNho, @NgayOnTapTiepTheo AS NgayOnTapTiepTheo, @Now AS ProcessedAt;
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0 ROLLBACK TRAN;

        DECLARE @ErrorNumber INT = ERROR_NUMBER(), @ErrorMessage NVARCHAR(4000) = ERROR_MESSAGE(), @ErrorLine INT = ERROR_LINE(), @ErrorProcedure NVARCHAR(200) = ERROR_PROCEDURE();
        DECLARE @ThrowMsg NVARCHAR(2048);
        SET @ThrowMsg = CONCAT(N'usp_GhiNhanLanTraLoiCauHoi failed. ErrorNumber=', @ErrorNumber, N', Procedure=', ISNULL(@ErrorProcedure, N''), N', Line=', @ErrorLine, N', Message=', @ErrorMessage);
        THROW 51000, @ThrowMsg, 1;
    END CATCH
END
GO

/* 10. OPTIONAL SEED DATA FOR REFERENCE */
INSERT INTO dbo.TuLoai (MaTuLoai, TenTuLoai, MoTa)
VALUES
(N'n',   N'Noun',       N'Danh từ'),
(N'v',   N'Verb',       N'Động từ'),
(N'adj', N'Adjective',  N'Tính từ'),
(N'adv', N'Adverb',     N'Trạng từ'),
(N'prep',N'Preposition',N'Giới từ');
GO


-- ============================================================
-- PHẦN 2: SEED DATA FINAL (DỮ LIỆU MẪU)
-- Chạy đoạn này trước Migration để không bị lỗi NOT NULL VaiTroID
-- ============================================================

USE NenTangTuVungTOEIC;
GO

BEGIN TRANSACTION;
BEGIN TRY
    -- 1. Tạo User hệ thống (để gán NguoiTaoID)
    DECLARE @SysQuanTriVienID BIGINT;
    IF NOT EXISTS (SELECT 1 FROM NguoiDung WHERE Email = 'system@vocaboost.com')
    BEGIN
        INSERT INTO NguoiDung (HoTen, Email, MatKhauHash, VaiTroNguoiDung, DangHoatDong)
        VALUES (N'System QuanTriVien', 'system@vocaboost.com', 'N/A', 'QuanTriVien', 1);
        SET @SysQuanTriVienID = SCOPE_IDENTITY();
    END
    ELSE
    BEGIN
        SELECT @SysQuanTriVienID = NguoiDungID FROM NguoiDung WHERE Email = 'system@vocaboost.com';
    END

    -- 2. Tạo Part Of Speeches
    IF NOT EXISTS (SELECT 1 FROM TuLoai WHERE MaTuLoai = 'Verb')
        INSERT INTO TuLoai (MaTuLoai, TenTuLoai) VALUES ('Verb', N'Động từ');
    IF NOT EXISTS (SELECT 1 FROM TuLoai WHERE MaTuLoai = 'Noun')
        INSERT INTO TuLoai (MaTuLoai, TenTuLoai) VALUES ('Noun', N'Danh từ');
    IF NOT EXISTS (SELECT 1 FROM TuLoai WHERE MaTuLoai = 'Adj')
        INSERT INTO TuLoai (MaTuLoai, TenTuLoai) VALUES ('Adj', N'Tính từ');

    -- 3. Tạo ChuDe mẫu
    DECLARE @ChuDeID BIGINT;
    IF NOT EXISTS (SELECT 1 FROM ChuDe WHERE MaChuDe = 'T50')
    BEGIN
        INSERT INTO ChuDe (TenChuDe, MaChuDe, MoTa, NguoiTaoID)
        VALUES (N'TOEIC Starter Core', 'T50', N'15 từ vựng nền tảng quan trọng nhất cho kỳ thi TOEIC', @SysQuanTriVienID);
        SET @ChuDeID = SCOPE_IDENTITY();
    END
    ELSE
    BEGIN
        SELECT @ChuDeID = ChuDeID FROM ChuDe WHERE MaChuDe = 'T50';
    END

    -- 4. Danh sách từ vựng
    DECLARE @TuVung TABLE (Tu NVARCHAR(100), Nghia NVARCHAR(255), PhienAm NVARCHAR(100), POSCode NVARCHAR(20), Example NVARCHAR(MAX));
    INSERT INTO @TuVung VALUES 
    ('Abandon', N'Từ bỏ, ruồng bỏ', '/əˈbændən/', 'Verb', N'The baby was abandoned by his parents.'),
    ('Accurate', N'Chính xác', '/ˈækjərət/', 'Adj', N'The map was very accurate.'),
    ('Benefit', N'Lợi ích', '/ˈbenɪfɪt/', 'Noun', N'The new law will benefit everyone.'),
    ('Capacity', N'Sức chứa, năng lực', '/kəˈpæsəti/', 'Noun', N'The stadium has a capacity of 50,000.'),
    ('Dedicate', N'Cống hiến', '/ˈdedɪkeɪt/', 'Verb', N'He dedicated his life to helping the poor.'),
    ('Efficient', N'Hiệu quả', '/ɪˈfɪʃnt/', 'Adj', N'The new machine is very efficient.'),
    ('Facilitate', N'Tạo điều kiện thuận lợi', '/fəˈsɪlɪteɪt/', 'Verb', N'The new app will facilitate communication.'),
    ('Generate', N'Tạo ra, phát sinh', '/ˈdʒenəreɪt/', 'Verb', N'The solar panels generate electricity.'),
    ('Hazard', N'Mối nguy hại', '/ˈhæzəd/', 'Noun', N'Smoking is a serious health hazard.'),
    ('Implement', N'Triển khai, thực hiện', '/ˈɪmplɪment/', 'Verb', N'The plan was implemented last week.'),
    ('Maintain', N'Bảo trì, duy trì', '/meɪnˈteɪn/', 'Verb', N'The roads are well maintained.'),
    ('Objective', N'Mục tiêu', '/əbˈdʒektɪv/', 'Noun', N'Our main objective is to win.'),
    ('Precise', N'Tỉ mỉ, chính xác', '/prɪˈsaɪs/', 'Adj', N'We need precise measurements.'),
    ('Quality', N'Chất lượng', '/ˈkwɒləti/', 'Noun', N'The quality of the food is high.'),
    ('Resources', N'Nguồn lực', '/rɪˈsɔːrsɪz/', 'Noun', N'We have limited resources.');

    -- 5. Vòng lặp chèn
    DECLARE @Tu NVARCHAR(100), @Nghia NVARCHAR(255), @PhienAm NVARCHAR(100), @POSCode NVARCHAR(20), @Example NVARCHAR(MAX);
    DECLARE @TuVungID BIGINT, @POSID INT;

    DECLARE cur CURSOR FOR SELECT Tu, Nghia, PhienAm, POSCode, Example FROM @TuVung;
    OPEN cur;
    FETCH NEXT FROM cur INTO @Tu, @Nghia, @PhienAm, @POSCode, @Example;

    WHILE @@FETCH_STATUS = 0
    BEGIN
        SELECT @POSID = TuLoaiID FROM TuLoai WHERE MaTuLoai = @POSCode;

        IF NOT EXISTS (SELECT 1 FROM TuVung WHERE Tu = @Tu AND TuLoaiID = @POSID)
        BEGIN
            INSERT INTO TuVung (Tu, Nghia, PhienAm, TuLoaiID, NguoiTaoID, MucDoKho)
            VALUES (@Tu, @Nghia, @PhienAm, @POSID, @SysQuanTriVienID, 1);
            SET @TuVungID = SCOPE_IDENTITY();

            INSERT INTO TuVungChuDe (TuVungID, ChuDeID) VALUES (@TuVungID, @ChuDeID);

            INSERT INTO CauHoi (TuVungID, LoaiCauHoi, NoiDungCauHoi, DapAnDung, LuaChonJSON, NguoiTaoID)
            VALUES (@TuVungID, 'MCQ', N'Định nghĩa của từ ''' + @Tu + N''' là gì?', @Nghia, 
            N'["' + @Nghia + N'", "Wrong Definition A", "Wrong Definition B", "Wrong Definition C"]', @SysQuanTriVienID);

            INSERT INTO CauHoi (TuVungID, LoaiCauHoi, NoiDungCauHoi, DapAnDung, LuaChonJSON, NguoiTaoID)
            VALUES (@TuVungID, 'DienKhuyet', REPLACE(@Example, @Tu, '______'), @Tu, N'[]', @SysQuanTriVienID);

            INSERT INTO CauHoi (TuVungID, LoaiCauHoi, NoiDungCauHoi, DapAnDung, LuaChonJSON, NguoiTaoID)
            VALUES (@TuVungID, 'Dictation', N'Listen and type the vocabulary word.', @Tu,
            N'{"instruction":"Listen and type the exact word","maxAttempts":3}', @SysQuanTriVienID);

            INSERT INTO CauHoi (TuVungID, LoaiCauHoi, NoiDungCauHoi, DapAnDung, LuaChonJSON, NguoiTaoID)
            VALUES (@TuVungID, 'DragDrop', N'Arrange the words into the correct sentence.', @Example,
            N'{"items":["' + REPLACE(@Example, N' ', N'","') + N'"]}', @SysQuanTriVienID);

            IF OBJECT_ID(N'dbo.TuVungPartsAssignment', N'U') IS NOT NULL
            BEGIN
                INSERT INTO TuVungPartsAssignment (TuVungID, PartID, RelevancyDiem)
                SELECT @TuVungID, PartID, 3
                FROM PartsClassification
                WHERE PartNumber IN (5, 7);
            END
        END
        FETCH NEXT FROM cur INTO @Tu, @Nghia, @PhienAm, @POSCode, @Example;
    END
    CLOSE cur;
    DEALLOCATE cur;
    COMMIT TRANSACTION;
    PRINT 'SEEDING COMPLETE SUCCESSFULLY IN NenTangTuVungTOEIC!';
END TRY
BEGIN CATCH
    IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION;
    PRINT 'ERROR: ' + ERROR_MESSAGE();
END CATCH
GO


-- ============================================================
-- PHẦN 3: MIGRATION DYNAMIC PERMISSIONS (FIXED V2)
-- ============================================================

USE NenTangTuVungTOEIC;
GO

-- Batch 1: Create Tables
IF OBJECT_ID('dbo.Quyen', 'U') IS NULL
CREATE TABLE dbo.Quyen (
    QuyenID INT IDENTITY(1,1) PRIMARY KEY,
    MaQuyen NVARCHAR(50) NOT NULL UNIQUE,
    MoTa NVARCHAR(255) NULL
);
GO

IF OBJECT_ID('dbo.VaiTro', 'U') IS NULL
CREATE TABLE dbo.VaiTro (
    VaiTroID INT IDENTITY(1,1) PRIMARY KEY,
    TenVaiTro NVARCHAR(50) NOT NULL UNIQUE,
    MoTa NVARCHAR(255) NULL
);
GO

IF OBJECT_ID('dbo.QuyenVaiTro', 'U') IS NULL
CREATE TABLE dbo.QuyenVaiTro (
    VaiTroID INT NOT NULL,
    QuyenID INT NOT NULL,
    CONSTRAINT PK_QuyenVaiTro PRIMARY KEY (VaiTroID, QuyenID),
    CONSTRAINT FK_QuyenVaiTro_Role FOREIGN KEY (VaiTroID) REFERENCES dbo.VaiTro(VaiTroID) ON DELETE CASCADE,
    CONSTRAINT FK_QuyenVaiTro_Permission FOREIGN KEY (QuyenID) REFERENCES dbo.Quyen(QuyenID) ON DELETE CASCADE
);
GO

-- Batch 2: Seed Initial Data
IF NOT EXISTS (SELECT 1 FROM dbo.VaiTro WHERE TenVaiTro = 'QuanTriVien')
BEGIN
    INSERT INTO dbo.Quyen (MaQuyen, MoTa)
    VALUES 
    ('XEM_BANG_DIEU_KHIEN', N'Xem dashboard'),
    ('QUAN_LY_TU_VUNG', N'Quản lý từ vựng'),
    ('QUAN_LY_CAU_HOI', N'Quản lý câu hỏi'),
    ('QUAN_LY_BAI_KIEM_TRA', N'Quản lý bài thi'),
    ('QUAN_LY_NGUOI_DUNG', N'Quản lý người dùng'),
    ('HOC_TU_VUNG', N'Học từ vựng');

    INSERT INTO dbo.VaiTro (TenVaiTro, MoTa)
    VALUES 
    ('QuanTriVien', N'Quản trị viên toàn quyền'),
    ('NguoiHoc', N'Người học thường');

    -- Assign Quyen to QuanTriVien (All)
    INSERT INTO dbo.QuyenVaiTro (VaiTroID, QuyenID)
    SELECT (SELECT VaiTroID FROM dbo.VaiTro WHERE TenVaiTro = 'QuanTriVien'), QuyenID FROM dbo.Quyen;

    -- Assign Quyen to NguoiHoc
    INSERT INTO dbo.QuyenVaiTro (VaiTroID, QuyenID)
    SELECT (SELECT VaiTroID FROM dbo.VaiTro WHERE TenVaiTro = 'NguoiHoc'), QuyenID 
    FROM dbo.Quyen WHERE MaQuyen IN ('XEM_BANG_DIEU_KHIEN', 'HOC_TU_VUNG');
END
GO

-- Batch 3: Add Column
IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('dbo.NguoiDung') AND name = 'VaiTroID')
BEGIN
    ALTER TABLE dbo.NguoiDung ADD VaiTroID INT NULL;
END
GO

-- Batch 4: Migrate Data
DECLARE @NguoiHocVaiTroID INT;
SELECT @NguoiHocVaiTroID = VaiTroID FROM dbo.VaiTro WHERE TenVaiTro = 'NguoiHoc';
DECLARE @QuanTriVienVaiTroID INT;
SELECT @QuanTriVienVaiTroID = VaiTroID FROM dbo.VaiTro WHERE TenVaiTro = 'QuanTriVien';

UPDATE dbo.NguoiDung SET VaiTroID = @QuanTriVienVaiTroID WHERE VaiTroNguoiDung = 'QuanTriVien' AND VaiTroID IS NULL;
UPDATE dbo.NguoiDung SET VaiTroID = @NguoiHocVaiTroID WHERE (VaiTroNguoiDung = 'NguoiHoc' OR VaiTroNguoiDung IS NULL) AND VaiTroID IS NULL;
UPDATE dbo.NguoiDung SET VaiTroID = @NguoiHocVaiTroID WHERE VaiTroID IS NULL;
GO

-- Batch 5: Make Non-Nullable
ALTER TABLE dbo.NguoiDung ALTER COLUMN VaiTroID INT NOT NULL;
GO


-- ============================================================
-- PHẦN 4: CONTENT CREATOR / TEACHER + TOPIC CATEGORIES EXTENSION
-- ============================================================

/*
    ============================================================
    MIGRATION: ADD CONTENT CREATOR / TEACHER ROLE
    Database: NenTangTuVungTOEIC
    MucDich:
      - Giữ nguyên hệ thống cũ
      - Bổ sung role BienTapVien / Teacher
      - Bổ sung permission
      - Bổ sung workflow duyệt/xuất bản nội dung
      - Bổ sung sổ tay cá nhân, chọn topic, media, analytics test
    ============================================================
*/

USE NenTangTuVungTOEIC;
GO

/* ============================================================
   1. ENSURE ROLE + PERMISSION TABLES EXIST
   ============================================================ */

IF OBJECT_ID(N'dbo.Quyen', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.Quyen
    (
        QuyenID INT IDENTITY(1,1) NOT NULL,
        MaQuyen NVARCHAR(50) NOT NULL,
        MoTa NVARCHAR(255) NULL,

        CONSTRAINT PK_Quyen PRIMARY KEY CLUSTERED (QuyenID),
        CONSTRAINT UQ_Quyen_MaQuyen UNIQUE (MaQuyen)
    );
END;
GO

IF OBJECT_ID(N'dbo.VaiTro', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.VaiTro
    (
        VaiTroID INT IDENTITY(1,1) NOT NULL,
        TenVaiTro NVARCHAR(50) NOT NULL,
        MoTa NVARCHAR(255) NULL,

        CONSTRAINT PK_VaiTro PRIMARY KEY CLUSTERED (VaiTroID),
        CONSTRAINT UQ_VaiTro_TenVaiTro UNIQUE (TenVaiTro)
    );
END;
GO

IF OBJECT_ID(N'dbo.QuyenVaiTro', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.QuyenVaiTro
    (
        VaiTroID INT NOT NULL,
        QuyenID INT NOT NULL,

        CONSTRAINT PK_QuyenVaiTro PRIMARY KEY CLUSTERED (VaiTroID, QuyenID),

        CONSTRAINT FK_QuyenVaiTro_VaiTroID FOREIGN KEY (VaiTroID)
            REFERENCES dbo.VaiTro(VaiTroID)
            ON DELETE CASCADE,

        CONSTRAINT FK_QuyenVaiTro_QuyenID FOREIGN KEY (QuyenID)
            REFERENCES dbo.Quyen(QuyenID)
            ON DELETE CASCADE
    );
END;
GO


/* ============================================================
   2. ADD VaiTroID TO NguoiDung IF MISSING
   ============================================================ */

IF COL_LENGTH(N'dbo.NguoiDung', N'VaiTroID') IS NULL
BEGIN
    ALTER TABLE dbo.NguoiDung ADD VaiTroID INT NULL;
END;
GO


/* ============================================================
   3. SEED ROLES
   ============================================================ */

IF NOT EXISTS (SELECT 1 FROM dbo.VaiTro WHERE TenVaiTro = N'QuanTriVien')
BEGIN
    INSERT INTO dbo.VaiTro (TenVaiTro, MoTa)
    VALUES (N'QuanTriVien', N'Quản trị viên toàn quyền');
END;
GO

IF NOT EXISTS (SELECT 1 FROM dbo.VaiTro WHERE TenVaiTro = N'NguoiHoc')
BEGIN
    INSERT INTO dbo.VaiTro (TenVaiTro, MoTa)
    VALUES (N'NguoiHoc', N'Người học');
END;
GO

IF NOT EXISTS (SELECT 1 FROM dbo.VaiTro WHERE TenVaiTro = N'BienTapVien')
BEGIN
    INSERT INTO dbo.VaiTro (TenVaiTro, MoTa)
    VALUES (N'BienTapVien', N'Biên tập viên / Giáo viên quản lý nội dung học tập');
END;
GO


/* ============================================================
   4. SEED PERMISSIONS
   ============================================================ */

INSERT INTO dbo.Quyen (MaQuyen, MoTa)
SELECT v.MaQuyen, v.MoTa
FROM
(
    VALUES
    (N'XEM_BANG_DIEU_KHIEN', N'Xem dashboard'),
    (N'HOC_TU_VUNG', N'Học từ vựng'),
    (N'DANG_KY_CHU_DE', N'Chọn / đăng ký bộ từ vựng'),
    (N'QUAN_LY_SO_TAY', N'Quản lý sổ tay từ vựng cá nhân'),

    (N'QUAN_LY_TU_VUNG', N'Quản lý từ vựng'),
    (N'QUAN_LY_CHU_DE', N'Quản lý bộ từ vựng / chủ đề'),
    (N'QUAN_LY_CAU_HOI', N'Quản lý ngân hàng câu hỏi'),
    (N'QUAN_LY_BAI_KIEM_TRA', N'Quản lý bài kiểm tra'),
    (N'QUAN_LY_MEDIA', N'Quản lý tệp âm thanh và hình ảnh minh họa'),

    (N'GUI_DUYET_NOI_DUNG', N'Gửi nội dung để duyệt'),
    (N'DUYET_NOI_DUNG', N'Duyệt / từ chối / lưu trữ nội dung'),
    (N'XUAT_BAN_NOI_DUNG_CA_NHAN', N'Xuất bản nội dung do mình tạo'),

    (N'XEM_PHAN_TICH_NOI_DUNG', N'Xem phân tích hiệu quả nội dung do mình tạo'),
    (N'XEM_PHAN_TICH_TOAN_CUC', N'Xem phân tích toàn cục'),
    (N'QUAN_LY_NGUOI_DUNG', N'Quản lý người dùng'),
    (N'QUAN_LY_CAI_DAT_HE_THONG', N'Quản lý cấu hình hệ thống')
) AS v(MaQuyen, MoTa)
WHERE NOT EXISTS
(
    SELECT 1
    FROM dbo.Quyen p
    WHERE p.MaQuyen = v.MaQuyen
);
GO


/* ============================================================
   5. ASSIGN PERMISSIONS TO ROLES
   ============================================================ */

-- NguoiHoc
INSERT INTO dbo.QuyenVaiTro (VaiTroID, QuyenID)
SELECT r.VaiTroID, p.QuyenID
FROM dbo.VaiTro r
JOIN dbo.Quyen p
    ON p.MaQuyen IN
    (
        N'XEM_BANG_DIEU_KHIEN',
        N'HOC_TU_VUNG',
        N'DANG_KY_CHU_DE',
        N'QUAN_LY_SO_TAY'
    )
WHERE r.TenVaiTro = N'NguoiHoc'
  AND NOT EXISTS
  (
      SELECT 1
      FROM dbo.QuyenVaiTro rp
      WHERE rp.VaiTroID = r.VaiTroID
        AND rp.QuyenID = p.QuyenID
  );
GO

-- Content Creator / Teacher
INSERT INTO dbo.QuyenVaiTro (VaiTroID, QuyenID)
SELECT r.VaiTroID, p.QuyenID
FROM dbo.VaiTro r
JOIN dbo.Quyen p
    ON p.MaQuyen IN
    (
        N'XEM_BANG_DIEU_KHIEN',
        N'HOC_TU_VUNG',
        N'QUAN_LY_TU_VUNG',
        N'QUAN_LY_CHU_DE',
        N'QUAN_LY_CAU_HOI',
        N'QUAN_LY_BAI_KIEM_TRA',
        N'QUAN_LY_MEDIA',
        N'GUI_DUYET_NOI_DUNG',
        N'XEM_PHAN_TICH_NOI_DUNG'
    )
WHERE r.TenVaiTro = N'BienTapVien'
  AND NOT EXISTS
  (
      SELECT 1
      FROM dbo.QuyenVaiTro rp
      WHERE rp.VaiTroID = r.VaiTroID
        AND rp.QuyenID = p.QuyenID
  );
GO

-- QuanTriVien
INSERT INTO dbo.QuyenVaiTro (VaiTroID, QuyenID)
SELECT r.VaiTroID, p.QuyenID
FROM dbo.VaiTro r
JOIN dbo.Quyen p
    ON p.MaQuyen IN
    (
        N'XEM_BANG_DIEU_KHIEN',
        N'HOC_TU_VUNG',
        N'DANG_KY_CHU_DE',
        N'QUAN_LY_SO_TAY',
        N'QUAN_LY_TU_VUNG',
        N'QUAN_LY_CHU_DE',
        N'QUAN_LY_CAU_HOI',
        N'QUAN_LY_BAI_KIEM_TRA',
        N'QUAN_LY_MEDIA',
        N'GUI_DUYET_NOI_DUNG',
        N'DUYET_NOI_DUNG',
        N'XUAT_BAN_NOI_DUNG_CA_NHAN',
        N'XEM_PHAN_TICH_NOI_DUNG',
        N'XEM_PHAN_TICH_TOAN_CUC',
        N'QUAN_LY_NGUOI_DUNG',
        N'QUAN_LY_CAI_DAT_HE_THONG'
    )
WHERE r.TenVaiTro = N'QuanTriVien'
  AND NOT EXISTS
  (
      SELECT 1
      FROM dbo.QuyenVaiTro rp
      WHERE rp.VaiTroID = r.VaiTroID
        AND rp.QuyenID = p.QuyenID
  );
GO


/* ============================================================
   6. MIGRATE NguoiDung.VaiTroID FROM NguoiDung.VaiTroNguoiDung
   ============================================================ */

DECLARE @QuanTriVienVaiTroID INT;
DECLARE @NguoiHocVaiTroID INT;
DECLARE @BienTapVienVaiTroID INT;

SELECT @QuanTriVienVaiTroID = VaiTroID FROM dbo.VaiTro WHERE TenVaiTro = N'QuanTriVien';
SELECT @NguoiHocVaiTroID = VaiTroID FROM dbo.VaiTro WHERE TenVaiTro = N'NguoiHoc';
SELECT @BienTapVienVaiTroID = VaiTroID FROM dbo.VaiTro WHERE TenVaiTro = N'BienTapVien';

UPDATE dbo.NguoiDung
SET VaiTroID = @QuanTriVienVaiTroID
WHERE VaiTroNguoiDung = N'QuanTriVien'
  AND (VaiTroID IS NULL OR VaiTroID <> @QuanTriVienVaiTroID);

UPDATE dbo.NguoiDung
SET VaiTroID = @BienTapVienVaiTroID
WHERE VaiTroNguoiDung = N'BienTapVien'
  AND (VaiTroID IS NULL OR VaiTroID <> @BienTapVienVaiTroID);

UPDATE dbo.NguoiDung
SET VaiTroID = @NguoiHocVaiTroID
WHERE VaiTroNguoiDung = N'NguoiHoc'
  AND (VaiTroID IS NULL OR VaiTroID <> @NguoiHocVaiTroID);

UPDATE dbo.NguoiDung
SET VaiTroID = @NguoiHocVaiTroID,
    VaiTroNguoiDung = N'NguoiHoc'
WHERE VaiTroID IS NULL;
GO

IF EXISTS
(
    SELECT 1
    FROM sys.columns
    WHERE object_id = OBJECT_ID(N'dbo.NguoiDung')
      AND name = N'VaiTroID'
      AND is_nullable = 1
)
BEGIN
    ALTER TABLE dbo.NguoiDung ALTER COLUMN VaiTroID INT NOT NULL;
END;
GO

IF NOT EXISTS
(
    SELECT 1
    FROM sys.foreign_keys
    WHERE name = N'FK_NguoiDung_VaiTroID'
)
BEGIN
    ALTER TABLE dbo.NguoiDung
    ADD CONSTRAINT FK_NguoiDung_VaiTroID FOREIGN KEY (VaiTroID)
        REFERENCES dbo.VaiTro(VaiTroID)
        ON DELETE NO ACTION;
END;
GO


/* ============================================================
   7. OPTIONAL: CREATE SAMPLE CONTENT CREATOR USER
   ============================================================ */

DECLARE @BienTapVienVaiTroID_ForUser INT;

SELECT @BienTapVienVaiTroID_ForUser = VaiTroID
FROM dbo.VaiTro
WHERE TenVaiTro = N'BienTapVien';

IF NOT EXISTS
(
    SELECT 1
    FROM dbo.NguoiDung
    WHERE Email = N'teacher@vocaboost.com'
)
BEGIN
    INSERT INTO dbo.NguoiDung
    (
        HoTen,
        Email,
        MatKhauHash,
        VaiTroNguoiDung,
        VaiTroID,
        DangHoatDong
    )
    VALUES
    (
        N'Biên tập viên / Giáo viên',
        N'teacher@vocaboost.com',
        N'CHANGE_ME_HASH',
        N'BienTapVien',
        @BienTapVienVaiTroID_ForUser,
        1
    );
END;
GO


/* ============================================================
   8. ADD CONTENT WORKFLOW COLUMNS
   ============================================================ */

-- ChuDe
IF COL_LENGTH(N'dbo.ChuDe', N'TrangThaiNoiDung') IS NULL
BEGIN
    ALTER TABLE dbo.ChuDe
    ADD TrangThaiNoiDung NVARCHAR(30) NOT NULL
        CONSTRAINT DF_ChuDe_TrangThaiNoiDung DEFAULT (N'DaXuatBan');
END;
GO

IF COL_LENGTH(N'dbo.ChuDe', N'NguoiDuyetID') IS NULL
BEGIN
    ALTER TABLE dbo.ChuDe ADD NguoiDuyetID BIGINT NULL;
END;
GO

IF COL_LENGTH(N'dbo.ChuDe', N'ThoiDiemDuyet') IS NULL
BEGIN
    ALTER TABLE dbo.ChuDe ADD ThoiDiemDuyet DATETIMEOFFSET(7) NULL;
END;
GO

IF COL_LENGTH(N'dbo.ChuDe', N'ThoiDiemXuatBan') IS NULL
BEGIN
    ALTER TABLE dbo.ChuDe ADD ThoiDiemXuatBan DATETIMEOFFSET(7) NULL;
END;
GO

-- TuVung
IF COL_LENGTH(N'dbo.TuVung', N'TrangThaiNoiDung') IS NULL
BEGIN
    ALTER TABLE dbo.TuVung
    ADD TrangThaiNoiDung NVARCHAR(30) NOT NULL
        CONSTRAINT DF_TuVung_TrangThaiNoiDung DEFAULT (N'DaXuatBan');
END;
GO

IF COL_LENGTH(N'dbo.TuVung', N'NguoiDuyetID') IS NULL
BEGIN
    ALTER TABLE dbo.TuVung ADD NguoiDuyetID BIGINT NULL;
END;
GO

IF COL_LENGTH(N'dbo.TuVung', N'ThoiDiemDuyet') IS NULL
BEGIN
    ALTER TABLE dbo.TuVung ADD ThoiDiemDuyet DATETIMEOFFSET(7) NULL;
END;
GO

IF COL_LENGTH(N'dbo.TuVung', N'ThoiDiemXuatBan') IS NULL
BEGIN
    ALTER TABLE dbo.TuVung ADD ThoiDiemXuatBan DATETIMEOFFSET(7) NULL;
END;
GO

-- CauHoi
IF COL_LENGTH(N'dbo.CauHoi', N'TrangThaiNoiDung') IS NULL
BEGIN
    ALTER TABLE dbo.CauHoi
    ADD TrangThaiNoiDung NVARCHAR(30) NOT NULL
        CONSTRAINT DF_CauHoi_TrangThaiNoiDung DEFAULT (N'DaXuatBan');
END;
GO

IF COL_LENGTH(N'dbo.CauHoi', N'NguoiDuyetID') IS NULL
BEGIN
    ALTER TABLE dbo.CauHoi ADD NguoiDuyetID BIGINT NULL;
END;
GO

IF COL_LENGTH(N'dbo.CauHoi', N'ThoiDiemDuyet') IS NULL
BEGIN
    ALTER TABLE dbo.CauHoi ADD ThoiDiemDuyet DATETIMEOFFSET(7) NULL;
END;
GO

IF COL_LENGTH(N'dbo.CauHoi', N'ThoiDiemXuatBan') IS NULL
BEGIN
    ALTER TABLE dbo.CauHoi ADD ThoiDiemXuatBan DATETIMEOFFSET(7) NULL;
END;
GO

-- BaiKiemTraNho
IF COL_LENGTH(N'dbo.BaiKiemTraNho', N'TrangThaiNoiDung') IS NULL
BEGIN
    ALTER TABLE dbo.BaiKiemTraNho
    ADD TrangThaiNoiDung NVARCHAR(30) NOT NULL
        CONSTRAINT DF_BaiKiemTraNho_TrangThaiNoiDung DEFAULT (N'BanNhap');
END;
GO

IF COL_LENGTH(N'dbo.BaiKiemTraNho', N'NguoiDuyetID') IS NULL
BEGIN
    ALTER TABLE dbo.BaiKiemTraNho ADD NguoiDuyetID BIGINT NULL;
END;
GO

IF COL_LENGTH(N'dbo.BaiKiemTraNho', N'ThoiDiemDuyet') IS NULL
BEGIN
    ALTER TABLE dbo.BaiKiemTraNho ADD ThoiDiemDuyet DATETIMEOFFSET(7) NULL;
END;
GO

IF COL_LENGTH(N'dbo.BaiKiemTraNho', N'ThoiDiemXuatBan') IS NULL
BEGIN
    ALTER TABLE dbo.BaiKiemTraNho ADD ThoiDiemXuatBan DATETIMEOFFSET(7) NULL;
END;
GO

UPDATE dbo.BaiKiemTraNho
SET TrangThaiNoiDung = CASE
    WHEN DaXuatBan = 1 THEN N'DaXuatBan'
    ELSE TrangThaiNoiDung
END
WHERE DaXuatBan = 1;
GO


/* ============================================================
   9. ADD CHECK CONSTRAINTS FOR CONTENT STATUS
   ============================================================ */

IF NOT EXISTS
(
    SELECT 1 FROM sys.check_constraints
    WHERE name = N'CK_ChuDe_TrangThaiNoiDung'
)
BEGIN
    ALTER TABLE dbo.ChuDe
    ADD CONSTRAINT CK_ChuDe_TrangThaiNoiDung
    CHECK (TrangThaiNoiDung IN (N'BanNhap', N'ChoDuyet', N'DaXuatBan', N'BiTuChoi', N'DaLuuTru'));
END;
GO

IF NOT EXISTS
(
    SELECT 1 FROM sys.check_constraints
    WHERE name = N'CK_TuVung_TrangThaiNoiDung'
)
BEGIN
    ALTER TABLE dbo.TuVung
    ADD CONSTRAINT CK_TuVung_TrangThaiNoiDung
    CHECK (TrangThaiNoiDung IN (N'BanNhap', N'ChoDuyet', N'DaXuatBan', N'BiTuChoi', N'DaLuuTru'));
END;
GO

IF NOT EXISTS
(
    SELECT 1 FROM sys.check_constraints
    WHERE name = N'CK_CauHoi_TrangThaiNoiDung'
)
BEGIN
    ALTER TABLE dbo.CauHoi
    ADD CONSTRAINT CK_CauHoi_TrangThaiNoiDung
    CHECK (TrangThaiNoiDung IN (N'BanNhap', N'ChoDuyet', N'DaXuatBan', N'BiTuChoi', N'DaLuuTru'));
END;
GO

IF NOT EXISTS
(
    SELECT 1 FROM sys.check_constraints
    WHERE name = N'CK_BaiKiemTraNho_TrangThaiNoiDung'
)
BEGIN
    ALTER TABLE dbo.BaiKiemTraNho
    ADD CONSTRAINT CK_BaiKiemTraNho_TrangThaiNoiDung
    CHECK (TrangThaiNoiDung IN (N'BanNhap', N'ChoDuyet', N'DaXuatBan', N'BiTuChoi', N'DaLuuTru'));
END;
GO


/* ============================================================
   10. ADD REVIEWED-BY FOREIGN KEYS
   ============================================================ */

IF NOT EXISTS
(
    SELECT 1 FROM sys.foreign_keys
    WHERE name = N'FK_ChuDe_NguoiDuyetID'
)
BEGIN
    ALTER TABLE dbo.ChuDe
    ADD CONSTRAINT FK_ChuDe_NguoiDuyetID FOREIGN KEY (NguoiDuyetID)
        REFERENCES dbo.NguoiDung(NguoiDungID)
        ON DELETE NO ACTION;
END;
GO

IF NOT EXISTS
(
    SELECT 1 FROM sys.foreign_keys
    WHERE name = N'FK_TuVung_NguoiDuyetID'
)
BEGIN
    ALTER TABLE dbo.TuVung
    ADD CONSTRAINT FK_TuVung_NguoiDuyetID FOREIGN KEY (NguoiDuyetID)
        REFERENCES dbo.NguoiDung(NguoiDungID)
        ON DELETE NO ACTION;
END;
GO

IF NOT EXISTS
(
    SELECT 1 FROM sys.foreign_keys
    WHERE name = N'FK_CauHoi_NguoiDuyetID'
)
BEGIN
    ALTER TABLE dbo.CauHoi
    ADD CONSTRAINT FK_CauHoi_NguoiDuyetID FOREIGN KEY (NguoiDuyetID)
        REFERENCES dbo.NguoiDung(NguoiDungID)
        ON DELETE NO ACTION;
END;
GO

IF NOT EXISTS
(
    SELECT 1 FROM sys.foreign_keys
    WHERE name = N'FK_BaiKiemTraNho_NguoiDuyetID'
)
BEGIN
    ALTER TABLE dbo.BaiKiemTraNho
    ADD CONSTRAINT FK_BaiKiemTraNho_NguoiDuyetID FOREIGN KEY (NguoiDuyetID)
        REFERENCES dbo.NguoiDung(NguoiDungID)
        ON DELETE NO ACTION;
END;
GO


/* ============================================================
   11. USER TOPIC ENROLLMENTS
   ============================================================ */

IF OBJECT_ID(N'dbo.DangKyChuDeNguoiDung', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.DangKyChuDeNguoiDung
    (
        DangKyChuDeNguoiDungID BIGINT IDENTITY(1,1) NOT NULL,
        NguoiDungID BIGINT NOT NULL,
        ChuDeID BIGINT NOT NULL,
        ThoiDiemDangKy DATETIMEOFFSET(7) NOT NULL
            CONSTRAINT DF_DangKyChuDeNguoiDung_ThoiDiemDangKy DEFAULT (SYSDATETIMEOFFSET()),
        DangHoatDong BIT NOT NULL
            CONSTRAINT DF_DangKyChuDeNguoiDung_DangHoatDong DEFAULT (1),

        CONSTRAINT PK_DangKyChuDeNguoiDung PRIMARY KEY CLUSTERED (DangKyChuDeNguoiDungID),

        CONSTRAINT FK_DangKyChuDeNguoiDung_NguoiDungID FOREIGN KEY (NguoiDungID)
            REFERENCES dbo.NguoiDung(NguoiDungID)
            ON DELETE CASCADE,

        CONSTRAINT FK_DangKyChuDeNguoiDung_ChuDeID FOREIGN KEY (ChuDeID)
            REFERENCES dbo.ChuDe(ChuDeID)
            ON DELETE CASCADE,

        CONSTRAINT UQ_DangKyChuDeNguoiDung_NguoiDungID_ChuDeID UNIQUE (NguoiDungID, ChuDeID)
    );
END;
GO

IF NOT EXISTS
(
    SELECT 1 FROM sys.indexes
    WHERE name = N'IX_DangKyChuDeNguoiDung_NguoiDungID'
      AND object_id = OBJECT_ID(N'dbo.DangKyChuDeNguoiDung')
)
BEGIN
    CREATE INDEX IX_DangKyChuDeNguoiDung_NguoiDungID
    ON dbo.DangKyChuDeNguoiDung(NguoiDungID, DangHoatDong);
END;
GO

IF NOT EXISTS
(
    SELECT 1 FROM sys.indexes
    WHERE name = N'IX_DangKyChuDeNguoiDung_ChuDeID'
      AND object_id = OBJECT_ID(N'dbo.DangKyChuDeNguoiDung')
)
BEGIN
    CREATE INDEX IX_DangKyChuDeNguoiDung_ChuDeID
    ON dbo.DangKyChuDeNguoiDung(ChuDeID, DangHoatDong);
END;
GO


/* ============================================================
   12. USER VOCABULARY NOTEBOOK
   ============================================================ */

IF OBJECT_ID(N'dbo.SoTayTuVungNguoiDung', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.SoTayTuVungNguoiDung
    (
        SoTayID BIGINT IDENTITY(1,1) NOT NULL,
        NguoiDungID BIGINT NOT NULL,
        TuVungID BIGINT NOT NULL,
        GhiChuCaNhan NVARCHAR(2000) NULL,
        YeuThich BIT NOT NULL
            CONSTRAINT DF_SoTayTuVungNguoiDung_YeuThich DEFAULT (0),
        ThoiDiemThem DATETIMEOFFSET(7) NOT NULL
            CONSTRAINT DF_SoTayTuVungNguoiDung_ThoiDiemThem DEFAULT (SYSDATETIMEOFFSET()),
        ThoiDiemCapNhat DATETIMEOFFSET(7) NOT NULL
            CONSTRAINT DF_SoTayTuVungNguoiDung_ThoiDiemCapNhat DEFAULT (SYSDATETIMEOFFSET()),

        CONSTRAINT PK_SoTayTuVungNguoiDung PRIMARY KEY CLUSTERED (SoTayID),

        CONSTRAINT FK_SoTayTuVungNguoiDung_NguoiDungID FOREIGN KEY (NguoiDungID)
            REFERENCES dbo.NguoiDung(NguoiDungID)
            ON DELETE CASCADE,

        CONSTRAINT FK_SoTayTuVungNguoiDung_TuVungID FOREIGN KEY (TuVungID)
            REFERENCES dbo.TuVung(TuVungID)
            ON DELETE CASCADE,

        CONSTRAINT UQ_SoTayTuVungNguoiDung_NguoiDungID_TuVungID UNIQUE (NguoiDungID, TuVungID)
    );
END;
GO

IF NOT EXISTS
(
    SELECT 1 FROM sys.indexes
    WHERE name = N'IX_SoTayTuVungNguoiDung_NguoiDungID'
      AND object_id = OBJECT_ID(N'dbo.SoTayTuVungNguoiDung')
)
BEGIN
    CREATE INDEX IX_SoTayTuVungNguoiDung_NguoiDungID
    ON dbo.SoTayTuVungNguoiDung(NguoiDungID, YeuThich);
END;
GO

IF NOT EXISTS
(
    SELECT 1 FROM sys.indexes
    WHERE name = N'IX_SoTayTuVungNguoiDung_TuVungID'
      AND object_id = OBJECT_ID(N'dbo.SoTayTuVungNguoiDung')
)
BEGIN
    CREATE INDEX IX_SoTayTuVungNguoiDung_TuVungID
    ON dbo.SoTayTuVungNguoiDung(TuVungID);
END;
GO


/* ============================================================
   13. CONTENT REVIEW LOGS
   ============================================================ */

IF OBJECT_ID(N'dbo.NhatKyDuyetNoiDung', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.NhatKyDuyetNoiDung
    (
        NhatKyDuyetNoiDungID BIGINT IDENTITY(1,1) NOT NULL,
        LoaiDoiTuong NVARCHAR(30) NOT NULL,
        DoiTuongID BIGINT NOT NULL,
        NguoiThucHienID BIGINT NOT NULL,
        TrangThaiCu NVARCHAR(30) NULL,
        TrangThaiMoi NVARCHAR(30) NOT NULL,
        GhiChu NVARCHAR(2000) NULL,
        ThoiDiemTao DATETIMEOFFSET(7) NOT NULL
            CONSTRAINT DF_NhatKyDuyetNoiDung_ThoiDiemTao DEFAULT (SYSDATETIMEOFFSET()),

        CONSTRAINT PK_NhatKyDuyetNoiDung PRIMARY KEY CLUSTERED (NhatKyDuyetNoiDungID),

        CONSTRAINT FK_NhatKyDuyetNoiDung_NguoiThucHienID FOREIGN KEY (NguoiThucHienID)
            REFERENCES dbo.NguoiDung(NguoiDungID)
            ON DELETE NO ACTION,

        CONSTRAINT CK_NhatKyDuyetNoiDung_LoaiDoiTuong CHECK
        (
            LoaiDoiTuong IN
            (
                N'ChuDe',
                N'TuVung',
                N'CauHoi',
                N'BaiKiemTraNho',
                N'CauViDu',
                N'TepMedia'
            )
        ),

        CONSTRAINT CK_NhatKyDuyetNoiDung_Status CHECK
        (
            TrangThaiMoi IN (N'BanNhap', N'ChoDuyet', N'DaXuatBan', N'BiTuChoi', N'DaLuuTru')
            AND
            (
                TrangThaiCu IS NULL
                OR TrangThaiCu IN (N'BanNhap', N'ChoDuyet', N'DaXuatBan', N'BiTuChoi', N'DaLuuTru')
            )
        )
    );
END;
GO

IF NOT EXISTS
(
    SELECT 1 FROM sys.indexes
    WHERE name = N'IX_NhatKyDuyetNoiDung_Entity'
      AND object_id = OBJECT_ID(N'dbo.NhatKyDuyetNoiDung')
)
BEGIN
    CREATE INDEX IX_NhatKyDuyetNoiDung_Entity
    ON dbo.NhatKyDuyetNoiDung(LoaiDoiTuong, DoiTuongID, ThoiDiemTao DESC);
END;
GO

IF NOT EXISTS
(
    SELECT 1 FROM sys.indexes
    WHERE name = N'IX_NhatKyDuyetNoiDung_NguoiThucHienID'
      AND object_id = OBJECT_ID(N'dbo.NhatKyDuyetNoiDung')
)
BEGIN
    CREATE INDEX IX_NhatKyDuyetNoiDung_NguoiThucHienID
    ON dbo.NhatKyDuyetNoiDung(NguoiThucHienID, ThoiDiemTao DESC);
END;
GO


/* ============================================================
   14. MEDIA ASSETS
   ============================================================ */

IF OBJECT_ID(N'dbo.TepMedia', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.TepMedia
    (
        TepMediaID BIGINT IDENTITY(1,1) NOT NULL,
        NguoiTaiLenID BIGINT NOT NULL,
        LoaiMedia NVARCHAR(30) NOT NULL,
        TepURL NVARCHAR(1000) NOT NULL,
        TenTep NVARCHAR(255) NULL,
        LoaiMIME NVARCHAR(100) NULL,
        KichThuocTepBytes BIGINT NULL,
        VanBanThayThe NVARCHAR(500) NULL,
        BanChepAm NVARCHAR(2000) NULL,
        ThoiDiemTao DATETIMEOFFSET(7) NOT NULL
            CONSTRAINT DF_TepMedia_ThoiDiemTao DEFAULT (SYSDATETIMEOFFSET()),

        CONSTRAINT PK_TepMedia PRIMARY KEY CLUSTERED (TepMediaID),

        CONSTRAINT FK_TepMedia_NguoiTaiLenID FOREIGN KEY (NguoiTaiLenID)
            REFERENCES dbo.NguoiDung(NguoiDungID)
            ON DELETE NO ACTION,

        CONSTRAINT CK_TepMedia_LoaiMedia CHECK
        (
            LoaiMedia IN
            (
                N'AudioUK',
                N'AudioUS',
                N'Image',
                N'ExampleAudio',
                N'CauHoiAudio',
                N'CauHoiImage'
            )
        ),

        CONSTRAINT CK_TepMedia_KichThuocTepBytes CHECK
        (
            KichThuocTepBytes IS NULL OR KichThuocTepBytes >= 0
        )
    );
END;
GO

IF OBJECT_ID(N'dbo.LienKetMediaNoiDung', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.LienKetMediaNoiDung
    (
        LienKetMediaNoiDungID BIGINT IDENTITY(1,1) NOT NULL,
        TepMediaID BIGINT NOT NULL,
        LoaiDoiTuong NVARCHAR(30) NOT NULL,
        DoiTuongID BIGINT NOT NULL,
        MucDich NVARCHAR(50) NULL,
        ThuTuHienThi INT NOT NULL
            CONSTRAINT DF_LienKetMediaNoiDung_ThuTuHienThi DEFAULT (1),

        CONSTRAINT PK_LienKetMediaNoiDung PRIMARY KEY CLUSTERED (LienKetMediaNoiDungID),

        CONSTRAINT FK_LienKetMediaNoiDung_TepMediaID FOREIGN KEY (TepMediaID)
            REFERENCES dbo.TepMedia(TepMediaID)
            ON DELETE CASCADE,

        CONSTRAINT CK_LienKetMediaNoiDung_LoaiDoiTuong CHECK
        (
            LoaiDoiTuong IN (N'TuVung', N'CauHoi', N'CauViDu', N'ChuDe')
        ),

        CONSTRAINT CK_LienKetMediaNoiDung_ThuTuHienThi CHECK (ThuTuHienThi > 0)
    );
END;
GO

IF NOT EXISTS
(
    SELECT 1 FROM sys.indexes
    WHERE name = N'IX_TepMedia_NguoiTaiLenID'
      AND object_id = OBJECT_ID(N'dbo.TepMedia')
)
BEGIN
    CREATE INDEX IX_TepMedia_NguoiTaiLenID
    ON dbo.TepMedia(NguoiTaiLenID, ThoiDiemTao DESC);
END;
GO

IF NOT EXISTS
(
    SELECT 1 FROM sys.indexes
    WHERE name = N'IX_LienKetMediaNoiDung_Entity'
      AND object_id = OBJECT_ID(N'dbo.LienKetMediaNoiDung')
)
BEGIN
    CREATE INDEX IX_LienKetMediaNoiDung_Entity
    ON dbo.LienKetMediaNoiDung(LoaiDoiTuong, DoiTuongID, ThuTuHienThi);
END;
GO

IF NOT EXISTS
(
    SELECT 1 FROM sys.indexes
    WHERE name = N'IX_LienKetMediaNoiDung_TepMediaID'
      AND object_id = OBJECT_ID(N'dbo.LienKetMediaNoiDung')
)
BEGIN
    CREATE INDEX IX_LienKetMediaNoiDung_TepMediaID
    ON dbo.LienKetMediaNoiDung(TepMediaID);
END;
GO


/* ============================================================
   15. MINI TEST ATTEMPTS
   ============================================================ */

IF OBJECT_ID(N'dbo.LanLamBaiKiemTraNho', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.LanLamBaiKiemTraNho
    (
        LanLamBaiKiemTraNhoID BIGINT IDENTITY(1,1) NOT NULL,
        BaiKiemTraNhoID BIGINT NOT NULL,
        NguoiDungID BIGINT NOT NULL,
        ThoiDiemBatDau DATETIMEOFFSET(7) NOT NULL
            CONSTRAINT DF_LanLamBaiKiemTraNho_ThoiDiemBatDau DEFAULT (SYSDATETIMEOFFSET()),
        ThoiDiemNop DATETIMEOFFSET(7) NULL,
        TongSoCauHoi INT NOT NULL
            CONSTRAINT DF_LanLamBaiKiemTraNho_TongSoCauHoi DEFAULT (0),
        SoCauDung INT NOT NULL
            CONSTRAINT DF_LanLamBaiKiemTraNho_SoCauDung DEFAULT (0),
        Diem DECIMAL(5,2) NULL,

        CONSTRAINT PK_LanLamBaiKiemTraNho PRIMARY KEY CLUSTERED (LanLamBaiKiemTraNhoID),

        CONSTRAINT FK_LanLamBaiKiemTraNho_BaiKiemTraNhoID FOREIGN KEY (BaiKiemTraNhoID)
            REFERENCES dbo.BaiKiemTraNho(BaiKiemTraNhoID)
            ON DELETE CASCADE,

        CONSTRAINT FK_LanLamBaiKiemTraNho_NguoiDungID FOREIGN KEY (NguoiDungID)
            REFERENCES dbo.NguoiDung(NguoiDungID)
            ON DELETE CASCADE,

        CONSTRAINT CK_LanLamBaiKiemTraNho_TongSoCauHoi CHECK (TongSoCauHoi >= 0),
        CONSTRAINT CK_LanLamBaiKiemTraNho_SoCauDung CHECK (SoCauDung >= 0),
        CONSTRAINT CK_LanLamBaiKiemTraNho_Diem CHECK (Diem IS NULL OR Diem BETWEEN 0 AND 100)
    );
END;
GO

IF NOT EXISTS
(
    SELECT 1 FROM sys.indexes
    WHERE name = N'IX_LanLamBaiKiemTraNho_NguoiDungID'
      AND object_id = OBJECT_ID(N'dbo.LanLamBaiKiemTraNho')
)
BEGIN
    CREATE INDEX IX_LanLamBaiKiemTraNho_NguoiDungID
    ON dbo.LanLamBaiKiemTraNho(NguoiDungID, ThoiDiemBatDau DESC);
END;
GO

IF NOT EXISTS
(
    SELECT 1 FROM sys.indexes
    WHERE name = N'IX_LanLamBaiKiemTraNho_BaiKiemTraNhoID'
      AND object_id = OBJECT_ID(N'dbo.LanLamBaiKiemTraNho')
)
BEGIN
    CREATE INDEX IX_LanLamBaiKiemTraNho_BaiKiemTraNhoID
    ON dbo.LanLamBaiKiemTraNho(BaiKiemTraNhoID, ThoiDiemBatDau DESC);
END;
GO


/* ============================================================
   16. USEFUL ANALYTICS VIEWS
   ============================================================ */

IF OBJECT_ID(N'dbo.vw_TongQuanNoiDungBienTapVien', N'V') IS NOT NULL
BEGIN
    DROP VIEW dbo.vw_TongQuanNoiDungBienTapVien;
END;
GO

CREATE VIEW dbo.vw_TongQuanNoiDungBienTapVien
AS
SELECT
    u.NguoiDungID,
    u.HoTen,
    u.Email,

    COUNT(DISTINCT t.ChuDeID) AS TongSoChuDe,
    COUNT(DISTINCT w.TuVungID) AS TongSoTuVung,
    COUNT(DISTINCT q.CauHoiID) AS TongSoCauHoi,
    COUNT(DISTINCT mt.BaiKiemTraNhoID) AS TongSoBaiKiemTraNho,

    SUM(CASE WHEN w.TrangThaiNoiDung = N'DaXuatBan' THEN 1 ELSE 0 END) AS SoTuDaXuatBan,
    SUM(CASE WHEN w.TrangThaiNoiDung = N'ChoDuyet' THEN 1 ELSE 0 END) AS SoTuChoDuyet,
    SUM(CASE WHEN w.TrangThaiNoiDung = N'BiTuChoi' THEN 1 ELSE 0 END) AS SoTuBiTuChoi
FROM dbo.NguoiDung u
LEFT JOIN dbo.ChuDe t
    ON t.NguoiTaoID = u.NguoiDungID
LEFT JOIN dbo.TuVung w
    ON w.NguoiTaoID = u.NguoiDungID
LEFT JOIN dbo.CauHoi q
    ON q.NguoiTaoID = u.NguoiDungID
LEFT JOIN dbo.BaiKiemTraNho mt
    ON mt.NguoiTaoID = u.NguoiDungID
WHERE u.VaiTroNguoiDung = N'BienTapVien'
GROUP BY
    u.NguoiDungID,
    u.HoTen,
    u.Email;
GO

IF OBJECT_ID(N'dbo.vw_PhanTichHocTapChuDe', N'V') IS NOT NULL
BEGIN
    DROP VIEW dbo.vw_PhanTichHocTapChuDe;
END;
GO

CREATE VIEW dbo.vw_PhanTichHocTapChuDe
AS
SELECT
    t.ChuDeID,
    t.TenChuDe,
    t.MaChuDe,

    COUNT(DISTINCT ute.NguoiDungID) AS TongSoNguoiHocDangKy,
    COUNT(DISTINCT wt.TuVungID) AS TongSoTuVung,
    COUNT(DISTINCT uwp.NguoiDungID) AS SoNguoiHocCoTienDo,

    AVG(CAST(uwp.MucDoThanhThao AS DECIMAL(10,2))) AS MucDoThanhThaoTrungBinh,
    AVG(CAST(uwp.DiemGanNhat AS DECIMAL(10,2))) AS DiemGanNhatTrungBinh,

    SUM(CASE WHEN uwp.TrangThaiGhiNho = N'DaThanhThao' THEN 1 ELSE 0 END) AS TongBanGhiDaThanhThao,
    SUM(CASE WHEN uwp.TrangThaiGhiNho = N'BiQuen' THEN 1 ELSE 0 END) AS TongBanGhiBiQuen
FROM dbo.ChuDe t
LEFT JOIN dbo.DangKyChuDeNguoiDung ute
    ON ute.ChuDeID = t.ChuDeID
    AND ute.DangHoatDong = 1
LEFT JOIN dbo.TuVungChuDe wt
    ON wt.ChuDeID = t.ChuDeID
LEFT JOIN dbo.TienDoTuVungNguoiDung uwp
    ON uwp.TuVungID = wt.TuVungID
GROUP BY
    t.ChuDeID,
    t.TenChuDe,
    t.MaChuDe;
GO

IF OBJECT_ID(N'dbo.vw_PhanTichBaiKiemTraNho', N'V') IS NOT NULL
BEGIN
    DROP VIEW dbo.vw_PhanTichBaiKiemTraNho;
END;
GO

CREATE VIEW dbo.vw_PhanTichBaiKiemTraNho
AS
SELECT
    mt.BaiKiemTraNhoID,
    mt.TieuDeBaiKiemTra,
    mt.ChuDeID,
    t.TenChuDe,

    COUNT(mta.LanLamBaiKiemTraNhoID) AS TongSoLuotLam,
    COUNT(DISTINCT mta.NguoiDungID) AS TongSoNguoiHoc,
    AVG(CAST(mta.Diem AS DECIMAL(10,2))) AS DiemTrungBinh,
    MIN(mta.Diem) AS DiemThapNhat,
    MAX(mta.Diem) AS DiemCaoNhat,

    SUM(CASE WHEN mta.ThoiDiemNop IS NOT NULL THEN 1 ELSE 0 END) AS SoLuotDaNop,
    SUM(CASE WHEN mta.ThoiDiemNop IS NULL THEN 1 ELSE 0 END) AS SoLuotChuaHoanThanh
FROM dbo.BaiKiemTraNho mt
LEFT JOIN dbo.ChuDe t
    ON t.ChuDeID = mt.ChuDeID
LEFT JOIN dbo.LanLamBaiKiemTraNho mta
    ON mta.BaiKiemTraNhoID = mt.BaiKiemTraNhoID
GROUP BY
    mt.BaiKiemTraNhoID,
    mt.TieuDeBaiKiemTra,
    mt.ChuDeID,
    t.TenChuDe;
GO



/* ============================================================
   18. TOPIC CATEGORIES / DANH MỤC CHỦ ĐỀ
   MucDich:
     - Thêm danh mục chủ đề cha cho ChuDe
     - Ví dụ: Business English -> Economy, Office, Meeting
     - Giữ NguoiHoc chọn ChuDe như cũ thông qua DangKyChuDeNguoiDung
   ============================================================ */

USE NenTangTuVungTOEIC;
GO

/* 18.1. CREATE DanhMucChuDe TABLE */
IF OBJECT_ID(N'dbo.DanhMucChuDe', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.DanhMucChuDe
    (
        DanhMucChuDeID BIGINT IDENTITY(1,1) NOT NULL,
        TenDanhMuc NVARCHAR(255) NOT NULL,
        MaDanhMuc NVARCHAR(100) NOT NULL,
        MoTa NVARCHAR(1000) NULL,
        IconURL NVARCHAR(1000) NULL,
        ThuTuHienThi INT NOT NULL
            CONSTRAINT DF_DanhMucChuDe_ThuTuHienThi DEFAULT (1),
        DangHoatDong BIT NOT NULL
            CONSTRAINT DF_DanhMucChuDe_DangHoatDong DEFAULT (1),
        NguoiTaoID BIGINT NULL,
        ThoiDiemTao DATETIMEOFFSET(7) NOT NULL
            CONSTRAINT DF_DanhMucChuDe_ThoiDiemTao DEFAULT (SYSDATETIMEOFFSET()),
        ThoiDiemCapNhat DATETIMEOFFSET(7) NOT NULL
            CONSTRAINT DF_DanhMucChuDe_ThoiDiemCapNhat DEFAULT (SYSDATETIMEOFFSET()),

        CONSTRAINT PK_DanhMucChuDe PRIMARY KEY CLUSTERED (DanhMucChuDeID),
        CONSTRAINT UQ_DanhMucChuDe_MaDanhMuc UNIQUE (MaDanhMuc),

        CONSTRAINT FK_DanhMucChuDe_NguoiTaoID FOREIGN KEY (NguoiTaoID)
            REFERENCES dbo.NguoiDung(NguoiDungID)
            ON DELETE NO ACTION,

        CONSTRAINT CK_DanhMucChuDe_ThuTuHienThi CHECK (ThuTuHienThi > 0)
    );
END;
GO

/* 18.2. ADD DanhMucChuDeID TO ChuDe */
IF COL_LENGTH(N'dbo.ChuDe', N'DanhMucChuDeID') IS NULL
BEGIN
    ALTER TABLE dbo.ChuDe
    ADD DanhMucChuDeID BIGINT NULL;
END;
GO

IF NOT EXISTS
(
    SELECT 1
    FROM sys.foreign_keys
    WHERE name = N'FK_ChuDe_DanhMucChuDeID'
)
BEGIN
    ALTER TABLE dbo.ChuDe
    ADD CONSTRAINT FK_ChuDe_DanhMucChuDeID FOREIGN KEY (DanhMucChuDeID)
        REFERENCES dbo.DanhMucChuDe(DanhMucChuDeID)
        ON DELETE NO ACTION;
END;
GO

/* 18.3. ADD INDEXES */
IF NOT EXISTS
(
    SELECT 1
    FROM sys.indexes
    WHERE name = N'IX_DanhMucChuDe_DangHoatDong_ThuTuHienThi'
      AND object_id = OBJECT_ID(N'dbo.DanhMucChuDe')
)
BEGIN
    CREATE INDEX IX_DanhMucChuDe_DangHoatDong_ThuTuHienThi
    ON dbo.DanhMucChuDe(DangHoatDong, ThuTuHienThi, TenDanhMuc);
END;
GO

IF NOT EXISTS
(
    SELECT 1
    FROM sys.indexes
    WHERE name = N'IX_ChuDe_DanhMucChuDeID_TrangThaiNoiDung'
      AND object_id = OBJECT_ID(N'dbo.ChuDe')
)
BEGIN
    CREATE INDEX IX_ChuDe_DanhMucChuDeID_TrangThaiNoiDung
    ON dbo.ChuDe(DanhMucChuDeID, TrangThaiNoiDung);
END;
GO

/* 18.4. SEED DEFAULT TOPIC CATEGORIES */
INSERT INTO dbo.DanhMucChuDe
(
    TenDanhMuc,
    MaDanhMuc,
    MoTa,
    ThuTuHienThi,
    DangHoatDong
)
SELECT v.TenDanhMuc, v.MaDanhMuc, v.MoTa, v.ThuTuHienThi, 1
FROM
(
    VALUES
    (N'Business English', N'BUSINESS_ENGLISH', N'Từ vựng tiếng Anh thương mại, công sở, kinh tế, hợp đồng, cuộc họp', 1),
    (N'Daily Life', N'DAILY_LIFE', N'Từ vựng giao tiếp đời sống hằng ngày', 2),
    (N'Travel English', N'TRAVEL_ENGLISH', N'Từ vựng du lịch, sân bay, khách sạn, chỉ đường', 3),
    (N'TOEIC Skills', N'TOEIC_SKILLS', N'Từ vựng và bài học theo kỹ năng TOEIC', 4),
    (N'Academic English', N'ACADEMIC_ENGLISH', N'Từ vựng học thuật, giáo dục, nghiên cứu', 5),
    (N'Technology', N'TECHNOLOGY', N'Từ vựng công nghệ, phần mềm, internet, dữ liệu', 6)
) AS v(TenDanhMuc, MaDanhMuc, MoTa, ThuTuHienThi)
WHERE NOT EXISTS
(
    SELECT 1
    FROM dbo.DanhMucChuDe tc
    WHERE tc.MaDanhMuc = v.MaDanhMuc
);
GO

/* 18.5. MAP EXISTING TOPICS TO CATEGORIES BY KEYWORD */
UPDATE t
SET DanhMucChuDeID = tc.DanhMucChuDeID
FROM dbo.ChuDe t
JOIN dbo.DanhMucChuDe tc
    ON tc.MaDanhMuc = N'BUSINESS_ENGLISH'
WHERE t.DanhMucChuDeID IS NULL
  AND
  (
      t.TenChuDe LIKE N'%Economy%'
      OR t.TenChuDe LIKE N'%Office%'
      OR t.TenChuDe LIKE N'%Business%'
      OR t.TenChuDe LIKE N'%Meeting%'
      OR t.TenChuDe LIKE N'%Contract%'
  );
GO

UPDATE t
SET DanhMucChuDeID = tc.DanhMucChuDeID
FROM dbo.ChuDe t
JOIN dbo.DanhMucChuDe tc
    ON tc.MaDanhMuc = N'TRAVEL_ENGLISH'
WHERE t.DanhMucChuDeID IS NULL
  AND
  (
      t.TenChuDe LIKE N'%Travel%'
      OR t.TenChuDe LIKE N'%Airport%'
      OR t.TenChuDe LIKE N'%Hotel%'
      OR t.TenChuDe LIKE N'%Direction%'
  );
GO

UPDATE t
SET DanhMucChuDeID = tc.DanhMucChuDeID
FROM dbo.ChuDe t
JOIN dbo.DanhMucChuDe tc
    ON tc.MaDanhMuc = N'TOEIC_SKILLS'
WHERE t.DanhMucChuDeID IS NULL
  AND
  (
      t.TenChuDe LIKE N'%TOEIC%'
      OR t.TenChuDe LIKE N'%Part 1%'
      OR t.TenChuDe LIKE N'%Part 2%'
      OR t.TenChuDe LIKE N'%Part 3%'
      OR t.TenChuDe LIKE N'%Part 4%'
      OR t.TenChuDe LIKE N'%Part 5%'
      OR t.TenChuDe LIKE N'%Part 6%'
      OR t.TenChuDe LIKE N'%Part 7%'
  );
GO

/* 18.6. ADD PERMISSION: QUAN_LY_DANH_MUC_CHU_DE */
INSERT INTO dbo.Quyen (MaQuyen, MoTa)
SELECT N'QUAN_LY_DANH_MUC_CHU_DE', N'Quản lý danh mục chủ đề'
WHERE NOT EXISTS
(
    SELECT 1
    FROM dbo.Quyen
    WHERE MaQuyen = N'QUAN_LY_DANH_MUC_CHU_DE'
);
GO

/* Khuyến nghị: chỉ QuanTriVien quản lý danh mục chủ đề */
INSERT INTO dbo.QuyenVaiTro (VaiTroID, QuyenID)
SELECT r.VaiTroID, p.QuyenID
FROM dbo.VaiTro r
JOIN dbo.Quyen p
    ON p.MaQuyen = N'QUAN_LY_DANH_MUC_CHU_DE'
WHERE r.TenVaiTro = N'QuanTriVien'
  AND NOT EXISTS
  (
      SELECT 1
      FROM dbo.QuyenVaiTro rp
      WHERE rp.VaiTroID = r.VaiTroID
        AND rp.QuyenID = p.QuyenID
  );
GO

/* 18.7. VIEW: CATEGORY SUMMARY */
IF OBJECT_ID(N'dbo.vw_TongQuanDanhMucChuDe', N'V') IS NOT NULL
BEGIN
    DROP VIEW dbo.vw_TongQuanDanhMucChuDe;
END;
GO

CREATE VIEW dbo.vw_TongQuanDanhMucChuDe
AS
SELECT
    tc.DanhMucChuDeID,
    tc.TenDanhMuc,
    tc.MaDanhMuc,
    tc.MoTa,
    tc.IconURL,
    tc.ThuTuHienThi,
    tc.DangHoatDong,
    COUNT(t.ChuDeID) AS TongSoChuDe,
    SUM
    (
        CASE
            WHEN t.TrangThaiNoiDung = N'DaXuatBan' THEN 1
            ELSE 0
        END
    ) AS SoChuDeDaXuatBan,
    SUM
    (
        CASE
            WHEN t.TrangThaiNoiDung = N'BanNhap' THEN 1
            ELSE 0
        END
    ) AS SoChuDeBanNhap,
    SUM
    (
        CASE
            WHEN t.TrangThaiNoiDung = N'ChoDuyet' THEN 1
            ELSE 0
        END
    ) AS SoChuDeChoDuyet
FROM dbo.DanhMucChuDe tc
LEFT JOIN dbo.ChuDe t
    ON t.DanhMucChuDeID = tc.DanhMucChuDeID
GROUP BY
    tc.DanhMucChuDeID,
    tc.TenDanhMuc,
    tc.MaDanhMuc,
    tc.MoTa,
    tc.IconURL,
    tc.ThuTuHienThi,
    tc.DangHoatDong;
GO

/* 18.8. FINAL CHECK: TOPIC CATEGORIES */
SELECT
    tc.DanhMucChuDeID,
    tc.TenDanhMuc,
    tc.MaDanhMuc,
    tc.ThuTuHienThi,
    tc.DangHoatDong,
    COUNT(t.ChuDeID) AS TongSoChuDe
FROM dbo.DanhMucChuDe tc
LEFT JOIN dbo.ChuDe t
    ON t.DanhMucChuDeID = tc.DanhMucChuDeID
GROUP BY
    tc.DanhMucChuDeID,
    tc.TenDanhMuc,
    tc.MaDanhMuc,
    tc.ThuTuHienThi,
    tc.DangHoatDong
ORDER BY tc.ThuTuHienThi;
GO


/* ============================================================
   17. FINAL CHECK RESULT
   ============================================================ */

SELECT
    r.TenVaiTro,
    COUNT(rp.QuyenID) AS PermissionCount
FROM dbo.VaiTro r
LEFT JOIN dbo.QuyenVaiTro rp
    ON rp.VaiTroID = r.VaiTroID
GROUP BY r.TenVaiTro
ORDER BY r.TenVaiTro;
GO

SELECT
    u.NguoiDungID,
    u.HoTen,
    u.Email,
    u.VaiTroNguoiDung,
    r.TenVaiTro,
    u.DangHoatDong
FROM dbo.NguoiDung u
JOIN dbo.VaiTro r
    ON r.VaiTroID = u.VaiTroID
ORDER BY u.NguoiDungID;
GO