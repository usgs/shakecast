#	@(#)Makefile	1.3	10/11/01	TriNet

include ../../../include/macros

#######################################################################
# See note below before adding anything to PROGS...
#######################################################################

INC_LIBS  = Common_reg.pm\
	    BJF97.pm\
	    Small.pm\
	    Somerville97.pm\
	    HazusPGV.pm\
	    Youngs97.pm\
	    Youngs97_interface.pm\
	    Youngs97_intraslab.pm\
	    AB02.pm\
	    AB02_interface.pm\
	    AB02_intraslab.pm\
	    AB95.pm\
	    AB95_table.pm\
	    table_03.xyz\
	    table_10.xyz\
	    table_30.xyz\
	    table_pga.xyz\
	    table_pgv.xyz\
            Temp.pm\
            Small_Seg.pm\
            Large_Seg.pm\
	    PP04.pm

LIB_DEST  = $(BASE)/perl/lib/Shake/Regression

DEST_LIBS = $(INC_LIBS:%=$(LIB_DEST)/%)

all install : $(DEST_LIBS)

dist : 
	@sccs get SCCS

clean :
	sccs clean

$(LIB_DEST)/% : %
	@echo "Installing $<"
	-@mkdir -p $(LIB_DEST)
	@$(INSTALL_644) $< $(LIB_DEST)
