USE P4_SCHEMA;
GO

-- 1. Create a Master Key (if not already created)
IF NOT EXISTS (SELECT * FROM sys.symmetric_keys WHERE name = '##MS_DatabaseMasterKey##')
BEGIN
    CREATE MASTER KEY ENCRYPTION BY PASSWORD = 'StrongPassword123!';
END;

-- 2. Open the Master Key for the current session
OPEN MASTER KEY DECRYPTION BY PASSWORD = 'StrongPassword123!';

-- 3. Create a Certificate and Symmetric Key (if not already created)
IF NOT EXISTS (SELECT * FROM sys.certificates WHERE name = 'MyCertificate')
BEGIN
    CREATE CERTIFICATE MyCertificate
    WITH SUBJECT = 'VerificationCode Encryption';
END;

IF NOT EXISTS (SELECT * FROM sys.symmetric_keys WHERE name = 'MySymmetricKey')
BEGIN
    CREATE SYMMETRIC KEY MySymmetricKey
    WITH ALGORITHM = AES_256
    ENCRYPTION BY CERTIFICATE MyCertificate;
END;

-- 5. Encrypt existing data into the EncryptedCode column
OPEN SYMMETRIC KEY MySymmetricKey
DECRYPTION BY CERTIFICATE MyCertificate;

UPDATE VerificationCode
SET EncryptedCode = ENCRYPTBYKEY(KEY_GUID('MySymmetricKey'), CAST(ExpirationDate AS NVARCHAR(MAX)));

CLOSE SYMMETRIC KEY MySymmetricKey;

-- 6. Insert new rows with encrypted ExpirationDate values
OPEN SYMMETRIC KEY MySymmetricKey
DECRYPTION BY CERTIFICATE MyCertificate;

CLOSE SYMMETRIC KEY MySymmetricKey;

-- 7. Retrieve and decrypt data for validation
OPEN SYMMETRIC KEY MySymmetricKey
DECRYPTION BY CERTIFICATE MyCertificate;

SELECT 
    VerificationCodeID, 
    ExpirationDate,
    EncryptedCode,
    CONVERT(NVARCHAR(MAX), DECRYPTBYKEY(EncryptedCode)) AS DecryptedExpirationDate
FROM VerificationCode;


CLOSE SYMMETRIC KEY MySymmetricKey;



SELECT 
    VerificationCodeID, 
    ExpirationDate,
    EncryptedCode,
    CONVERT(NVARCHAR(MAX), DECRYPTBYKEY(EncryptedCode)) AS DecryptedExpirationDate
FROM VerificationCode;
