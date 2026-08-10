BEGIN TRY

BEGIN TRAN;

-- CreateTable
CREATE TABLE [dbo].[User] (
    [id] INT NOT NULL IDENTITY(1,1),
    [username] NVARCHAR(1000) NOT NULL,
    [email] NVARCHAR(1000) NOT NULL,
    [passwordHash] NVARCHAR(1000) NOT NULL,
    [role] NVARCHAR(1000) NOT NULL CONSTRAINT [User_role_df] DEFAULT 'USER',
    [isActive] BIT NOT NULL CONSTRAINT [User_isActive_df] DEFAULT 1,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [User_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL,
    CONSTRAINT [User_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [User_username_key] UNIQUE NONCLUSTERED ([username]),
    CONSTRAINT [User_email_key] UNIQUE NONCLUSTERED ([email])
);

-- CreateTable
CREATE TABLE [dbo].[Score] (
    [id] INT NOT NULL IDENTITY(1,1),
    [userId] INT NOT NULL,
    [score] INT NOT NULL,
    [level] INT NOT NULL,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [Score_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT [Score_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[GameSession] (
    [id] INT NOT NULL IDENTITY(1,1),
    [userId] INT NOT NULL,
    [score] INT NOT NULL,
    [level] INT NOT NULL,
    [duration] INT NOT NULL,
    [startedAt] DATETIME2 NOT NULL,
    [endedAt] DATETIME2 NOT NULL,
    CONSTRAINT [GameSession_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[Achievement] (
    [id] INT NOT NULL IDENTITY(1,1),
    [name] NVARCHAR(1000) NOT NULL,
    [description] NVARCHAR(1000) NOT NULL,
    [requirement] INT NOT NULL,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [Achievement_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT [Achievement_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [Achievement_name_key] UNIQUE NONCLUSTERED ([name])
);

-- CreateTable
CREATE TABLE [dbo].[UserAchievement] (
    [id] INT NOT NULL IDENTITY(1,1),
    [userId] INT NOT NULL,
    [achievementId] INT NOT NULL,
    [unlockedAt] DATETIME2 NOT NULL CONSTRAINT [UserAchievement_unlockedAt_df] DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT [UserAchievement_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [UserAchievement_userId_achievementId_key] UNIQUE NONCLUSTERED ([userId],[achievementId])
);

-- CreateTable
CREATE TABLE [dbo].[RefreshToken] (
    [id] INT NOT NULL IDENTITY(1,1),
    [userId] INT NOT NULL,
    [token] NVARCHAR(1000) NOT NULL,
    [expiresAt] DATETIME2 NOT NULL,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [RefreshToken_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT [RefreshToken_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [RefreshToken_token_key] UNIQUE NONCLUSTERED ([token])
);

-- CreateTable
CREATE TABLE [dbo].[AuditLog] (
    [id] INT NOT NULL IDENTITY(1,1),
    [userId] INT,
    [action] NVARCHAR(1000) NOT NULL,
    [entity] NVARCHAR(1000),
    [entityId] INT,
    [ipAddress] NVARCHAR(1000),
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [AuditLog_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT [AuditLog_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateIndex
CREATE NONCLUSTERED INDEX [Score_userId_idx] ON [dbo].[Score]([userId]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [Score_score_idx] ON [dbo].[Score]([score]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [Score_createdAt_idx] ON [dbo].[Score]([createdAt]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [GameSession_userId_idx] ON [dbo].[GameSession]([userId]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [GameSession_startedAt_idx] ON [dbo].[GameSession]([startedAt]);

-- AddForeignKey
ALTER TABLE [dbo].[Score] ADD CONSTRAINT [Score_userId_fkey] FOREIGN KEY ([userId]) REFERENCES [dbo].[User]([id]) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[GameSession] ADD CONSTRAINT [GameSession_userId_fkey] FOREIGN KEY ([userId]) REFERENCES [dbo].[User]([id]) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[UserAchievement] ADD CONSTRAINT [UserAchievement_userId_fkey] FOREIGN KEY ([userId]) REFERENCES [dbo].[User]([id]) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[UserAchievement] ADD CONSTRAINT [UserAchievement_achievementId_fkey] FOREIGN KEY ([achievementId]) REFERENCES [dbo].[Achievement]([id]) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[RefreshToken] ADD CONSTRAINT [RefreshToken_userId_fkey] FOREIGN KEY ([userId]) REFERENCES [dbo].[User]([id]) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[AuditLog] ADD CONSTRAINT [AuditLog_userId_fkey] FOREIGN KEY ([userId]) REFERENCES [dbo].[User]([id]) ON DELETE SET NULL ON UPDATE CASCADE;

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
