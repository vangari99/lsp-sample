//DV550AOP JOB ACCT,'DV550A POP-EXCT',MSGCLASS=X,MSGLEVEL=(1,1),
//             NOTIFY=&SYSUID,CLASS=A,
//             REGION=4M
//*****************************************************************
//*      JCL FOR A STANDARD SMS INSTALL OF AN ASGPOP PACKAGE      *
//* NOW WE ARE READY TO POP AND GET OUR PRODUCT FILES.            *
//*****************************************************************
//ASGPOP   EXEC  PGM=IKJEFT01,
//             PARM='%ASGPOP JCL2',
//             DYNAMNBR=64
//SYSEXEC  DD  DSN=DV550A.ASGPOP.XMO, <=== CHANGE
//             DISP=SHR
//SYSPRINT DD  SYSOUT=*
//SYSTSPRT DD  SYSOUT=*
//SYSUT3   DD  UNIT=SYSALLDA,
//             SPACE=(CYL,(10,5))
//SYSUT4   DD  UNIT=SYSALLDA,
//             SPACE=(CYL,(10,5))
//SYSTSIN  DD  DUMMY
//POPINP   DD  *
PKGFILE=DV550A.PJM350.POP  SHOULD END WITH .POP        <=== CHANGE
FILETYPE=POP           Required
PREFIX=ESWDVPJ.PJ35NV00 Unique prefix for this package <=== CHANGE
REPLACE=YES            YES|NO                          <=== CHANGE
XMICYLS=108            Number of CYLs for XMI work ds
HASH=7CD168F0          Checksum hash value
/*
