//RUNFIB2  JOB (ESW),'COBOL 6.2 RUN',NOTIFY=&SYSUID,               
//        CLASS=A,MSGCLASS=X,MSGLEVEL=(1,1),TIME=1438              
//*                                                                
//STEPCOMP EXEC PGM=FIBCHEC2,REGION=0M,PARM='       5'             
//*STEPCOMP EXEC PGM=FIBCHECK,REGION=0M,PARM='       5'            
//STEPLIB  DD  DSN=TS4447.DEMO.LOADPDSE,DISP=SHR                   
//         DD  DSN=CEE.SCEERUN,DISP=SHR                            
//         DD  DSN=CEE.SCEERUN2,DISP=SHR                           
//SYSOUT   DD  SYSOUT=*                                            
//*ERRFILE  DD  SYSOUT=*                                           