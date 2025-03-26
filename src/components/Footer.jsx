import styled from "@emotion/styled";

const FooterContainer = styled.footer`
  background-color: ${(props) => props.theme.colors.primary};
  color: ${(props) => props.theme.colors.white};
  padding: ${(props) => props.theme.spacing.xl};
  margin-top: auto;
`;

const FooterContent = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: ${(props) => props.theme.spacing.md};
`;

const FooterSection = styled.div`
  flex: 1;
  min-width: 250px;
`;

const FooterTitle = styled.h3`
  margin-bottom: ${(props) => props.theme.spacing.md};
  font-size: ${(props) => props.theme.typography.h3.fontSize};
`;

const FooterText = styled.p`
  margin: ${(props) => props.theme.spacing.sm} 0;
  color: ${(props) => props.theme.colors.gray};
`;

const Footer = () => {
  return (
    <FooterContainer>
      <FooterContent>
        <FooterSection>
          <FooterTitle>About Us</FooterTitle>
          <FooterText>
            A collection of classic and modern games for everyone to enjoy.
            Challenge yourself and have fun!
          </FooterText>
        </FooterSection>
        <FooterSection>
          <FooterTitle>Quick Links</FooterTitle>
          <FooterText>Home</FooterText>
          <FooterText>Games</FooterText>
          <FooterText>Contact</FooterText>
        </FooterSection>
        <FooterSection>
          <FooterTitle>Contact</FooterTitle>
          <FooterText>Email: support@gamecollection.com</FooterText>
          <FooterText>Phone: (555) 123-4567</FooterText>
        </FooterSection>
      </FooterContent>
    </FooterContainer>
  );
};

export default Footer;
